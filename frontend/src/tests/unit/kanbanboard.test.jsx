import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";

const listeners = {};
const mockSocket = {
  on: vi.fn((event, cb) => {
    listeners[event] = cb;
  }),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
  __trigger: (event, data) => {
    if (listeners[event]) listeners[event](data);
  },
};

vi.mock("socket.io-client", () => ({
  default: vi.fn(() => mockSocket),
  io: vi.fn(() => mockSocket),
}));

import KanbanBoard from "../../components/KanbanBoard";


const sampleTask = {
  id: "1",
  title: "Test Task",
  description: "Test Description",
  status: "To Do",
  priority: "Medium",
  category: "Feature",
  attachments: [],
};

const sampleTasks = [
  sampleTask,
  {
    id: "2",
    title: "In Progress Task",
    description: "Working on it",
    status: "In Progress",
    priority: "High",
    category: "Bug",
    attachments: [],
  },
  {
    id: "3",
    title: "Done Task",
    description: "Completed work",
    status: "Done",
    priority: "Low",
    category: "Enhancement",
    attachments: [],
  },
];

async function renderBoard(tasks = [sampleTask]) {
  render(<KanbanBoard />);
  mockSocket.__trigger("sync:task", tasks);
  await waitFor(() =>
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
  );
}


describe("KanbanBoard Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });



  test("renders loading state initially", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByText("Connecting to board...")).toBeInTheDocument();
  });

  test("renders all three Kanban columns after sync", async () => {
    await renderBoard();

    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In Progress" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
  });

  test("displays synced tasks in the correct columns", async () => {
    await renderBoard(sampleTasks);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("In Progress Task")).toBeInTheDocument();
    expect(screen.getByText("Done Task")).toBeInTheDocument();
  });

  test("displays task description", async () => {
    await renderBoard();

    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });


  test("renders priority badge with correct class for High priority", async () => {
    await renderBoard([{ ...sampleTask, priority: "High" }]);

    const badge = screen.getByText(/High/);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("priority-high");
  });

  test("renders priority badge with correct class for Medium priority", async () => {
    await renderBoard();

    const badges = screen.getAllByText(/Medium/);
    const priorityBadge = badges.find((el) => el.className.includes("priority-medium"));
    expect(priorityBadge).toBeTruthy();
    expect(priorityBadge.className).toContain("priority-medium");
  });

  test("renders priority badge with correct class for Low priority", async () => {
    await renderBoard([{ ...sampleTask, priority: "Low" }]);

    const badge = screen.getByText(/Low/);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("priority-low");
  });


  test("renders category label correctly", async () => {
    await renderBoard();

    const badges = screen.getAllByText("Feature");
    expect(badges.length).toBeGreaterThan(0);
  });


  test("can type a title into the add task form", async () => {
    await renderBoard();

    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "New Task Title" } });
    expect(titleInput.value).toBe("New Task Title");
  });

  test("submitting form calls socket.emit with task:create and correct data", async () => {
    await renderBoard();

    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "My New Task" } });

    const descInput = screen.getByPlaceholderText("Add more details...");
    fireEvent.change(descInput, { target: { value: "A task description" } });

    const form = screen.getByTestId("add-task-btn");
    fireEvent.click(form);

    expect(mockSocket.emit).toHaveBeenCalledWith("create:task", expect.objectContaining({
      title: "My New Task",
      description: "A task description",
      status: "To Do",
      priority: "Medium",
      category: "Feature",
    }));
  });

  test("empty title prevents form submission", async () => {
    await renderBoard();

    const addButton = screen.getByTestId("add-task-btn");
    expect(addButton).toBeDisabled();

    fireEvent.click(addButton);
    expect(mockSocket.emit).not.toHaveBeenCalledWith("create:task", expect.anything());
  });


  test("delete button calls socket.emit with task:delete", async () => {
    await renderBoard();

    const deleteBtn = screen.getByLabelText("Delete task");
    fireEvent.click(deleteBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith("task:delete", "1");
  });


  test("invalid file type shows error message", async () => {
    await renderBoard();

    const fileInput = screen.getByTestId("file-upload-input");
    const invalidFile = new File(["test"], "test.exe", { type: "application/x-msdownload" });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByTestId("file-error")).toBeInTheDocument();
      expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
    });
  });

  test("progress chart renders with correct stats", async () => {
    await renderBoard(sampleTasks);

    const totalTasks = screen.getByTestId("total-tasks");
    expect(totalTasks.textContent).toBe("3");

    const doneTasks = screen.getByTestId("done-tasks");
    expect(doneTasks.textContent).toBe("1");

    const completionPercent = screen.getByTestId("completion-percent");
    expect(completionPercent.textContent).toBe("33%");
  });



  test("column count badges show correct task counts", async () => {
    await renderBoard(sampleTasks);

    const todoCount = screen.getByTestId("count-To Do");
    expect(todoCount.textContent).toBe("1");

    const progressCount = screen.getByTestId("count-In Progress");
    expect(progressCount.textContent).toBe("1");

    const doneCount = screen.getByTestId("count-Done");
    expect(doneCount.textContent).toBe("1");
  });
});
