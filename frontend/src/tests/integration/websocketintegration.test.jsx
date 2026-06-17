import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";


const listeners = {};
const mockSocket = {
  on: vi.fn((event, cb) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(cb);
  }),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
  __trigger: (event, data) => {
    if (listeners[event]) {
      listeners[event].forEach((cb) => cb(data));
    }
  },
};

vi.mock("socket.io-client", () => ({
  default: vi.fn(() => mockSocket),
  io: vi.fn(() => mockSocket),
}));

import KanbanBoard from "../../components/KanbanBoard";


const createTask = (overrides = {}) => ({
  id: Date.now().toString(),
  title: "Test Task",
  description: "Test Desc",
  status: "To Do",
  priority: "Medium",
  category: "Feature",
  attachments: [],
  ...overrides,
});


async function renderAndSync(initialTasks = []) {
  render(<KanbanBoard />);
  mockSocket.__trigger("sync:task", initialTasks);
  await waitFor(() =>
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument()
  );
}


describe("WebSocket Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });


  test("adds a task when task:created event is received", async () => {
    await renderAndSync([]);

    const newTask = createTask({
      id: "ws-1",
      title: "Real-time Task",
      priority: "High",
      category: "Bug",
    });

    mockSocket.__trigger("task:created", newTask);

    await waitFor(() => {
      expect(screen.getByText("Real-time Task")).toBeInTheDocument();
      expect(screen.getByText(/High/)).toBeInTheDocument();
    });
  });

  // ===== Task Deleted Event =====
  test("removes a task when task:deleted event is received", async () => {
    const task = createTask({ id: "del-1", title: "Task to Delete" });
    await renderAndSync([task]);

    expect(screen.getByText("Task to Delete")).toBeInTheDocument();

    mockSocket.__trigger("task:deleted", "del-1");

    await waitFor(() =>
      expect(screen.queryByText("Task to Delete")).not.toBeInTheDocument()
    );
  });


  test("updates a task when task:updated event is received", async () => {
    const task = createTask({ id: "upd-1", title: "Original Title" });
    await renderAndSync([task]);

    expect(screen.getByText("Original Title")).toBeInTheDocument();

    mockSocket.__trigger("task:updated", {
      ...task,
      title: "Updated Title",
      priority: "High",
    });

    await waitFor(() => {
      expect(screen.queryByText("Original Title")).not.toBeInTheDocument();
      expect(screen.getByText("Updated Title")).toBeInTheDocument();
    });
  });


  test("moves a task to a new column when task:moved event is received", async () => {
    const task = createTask({ id: "mov-1", title: "Moving Task", status: "To Do" });
    await renderAndSync([task]);

    const todoCount = screen.getByTestId("count-To Do");
    expect(todoCount.textContent).toBe("1");

    mockSocket.__trigger("task:moved", { ...task, status: "Done" });

    await waitFor(() => {
      expect(screen.getByTestId("count-To Do").textContent).toBe("0");
      expect(screen.getByTestId("count-Done").textContent).toBe("1");
    });
  });


  test("handles multiple rapid events correctly", async () => {
    await renderAndSync([]);

    mockSocket.__trigger("task:created", createTask({ id: "r1", title: "Rapid 1" }));
    mockSocket.__trigger("task:created", createTask({ id: "r2", title: "Rapid 2" }));
    mockSocket.__trigger("task:created", createTask({ id: "r3", title: "Rapid 3" }));

    await waitFor(() => {
      expect(screen.getByText("Rapid 1")).toBeInTheDocument();
      expect(screen.getByText("Rapid 2")).toBeInTheDocument();
      expect(screen.getByText("Rapid 3")).toBeInTheDocument();
    });


    expect(screen.getByTestId("total-tasks").textContent).toBe("3");
  });


  test("creating a task via form emits correct socket event with all fields", async () => {
    await renderAndSync([]);

    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(titleInput, { target: { value: "Form Task" } });

    const descInput = screen.getByPlaceholderText("Add more details...");
    fireEvent.change(descInput, { target: { value: "Desc from form" } });

    fireEvent.click(screen.getByTestId("add-task-btn"));

    expect(mockSocket.emit).toHaveBeenCalledWith(
      "create:task",
      expect.objectContaining({
        title: "Form Task",
        description: "Desc from form",
        status: "To Do",
        priority: "Medium",
        category: "Feature",
        attachments: [],
      })
    );
  });

  test("chart updates reactively when tasks change columns", async () => {
    const tasks = [
      createTask({ id: "c1", title: "Task A", status: "To Do" }),
      createTask({ id: "c2", title: "Task B", status: "To Do" }),
    ];
    await renderAndSync(tasks);

    expect(screen.getByTestId("total-tasks").textContent).toBe("2");
    expect(screen.getByTestId("done-tasks").textContent).toBe("0");
    expect(screen.getByTestId("completion-percent").textContent).toBe("0%");

    mockSocket.__trigger("task:moved", { ...tasks[0], status: "Done" });

    await waitFor(() => {
      expect(screen.getByTestId("done-tasks").textContent).toBe("1");
      expect(screen.getByTestId("completion-percent").textContent).toBe("50%");
    });
  });

 
  test("clicking delete button emits task:delete event", async () => {
    const task = createTask({ id: "del-btn-1", title: "Deletable" });
    await renderAndSync([task]);

    const deleteBtn = screen.getByLabelText("Delete task");
    fireEvent.click(deleteBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith("task:delete", "del-btn-1");
  });
});
