import { test, expect } from '@playwright/test';
import path from "path";
import { fileURLToPath } from "url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Kanban Board E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector("[data-testid='loading']", { state: "detached", timeout: 10000 });
  });



  test("Board displays all three columns with correct headers", async ({ page }) => {
    await expect(page.getByText("To Do")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
  });

  test("Board shows the header with title", async ({ page }) => {
    await expect(page.locator(".app-header h1")).toContainText("Kanban Board");
  });

  test("Board shows connection status indicator", async ({ page }) => {
    await expect(page.locator(".connection-dot")).toBeVisible();
  });



  test("User can create a task and see it on the board", async ({ page }) => {
    await page.getByPlaceholder("Enter task title...").fill("E2E Task");
    await page.getByPlaceholder("Describe the task...").fill("Testing with Playwright");
    await page.getByTestId("add-task-btn").click();


    await expect(page.getByText("E2E Task")).toBeVisible();
    await expect(page.getByText("Testing with Playwright")).toBeVisible();
  });

  test("User can delete a task and see it removed", async ({ page }) => {
    await page.getByPlaceholder("Enter task title...").fill("Task to Delete");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Task to Delete")).toBeVisible();


    const taskCards = page.locator(".task-card");
    const lastTask = taskCards.last();
    await lastTask.getByRole("button", { name: "Delete task" }).click();


    await expect(page.getByText("Task to Delete")).not.toBeVisible();
  });

  test("Add task button is disabled when title is empty", async ({ page }) => {
    const addBtn = page.getByTestId("add-task-btn");
    await expect(addBtn).toBeDisabled();
  });


  test("User can select a High priority level", async ({ page }) => {
    const prioritySelect = page.locator("#priority-select").locator("..");
    await prioritySelect.click();


    await page.getByText(" High").click();


    await page.getByPlaceholder("Enter task title...").fill("High Priority Task");
    await page.getByTestId("add-task-btn").click();

    await expect(page.locator(".priority-high").last()).toContainText("High");
  });



  test("User can change the task category", async ({ page }) => {
    const categorySelect = page.locator("#category-select").locator("..");
    await categorySelect.click();

    await page.getByText("Bug").click();

    await page.getByPlaceholder("Enter task title...").fill("Bug Task");
    await page.getByTestId("add-task-btn").click();

    await expect(page.getByText("Bug").last()).toBeVisible();
  });



  test("User can upload an image attachment", async ({ page }) => {
    const fileInput = page.getByTestId("file-upload-input");

    await fileInput.setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
    });

    await expect(page.locator(".attachment-preview")).toBeVisible();
  });

  test("Invalid file type shows error message", async ({ page }) => {
    const fileInput = page.getByTestId("file-upload-input");

    await fileInput.setInputFiles({
      name: "malware.exe",
      mimeType: "application/x-msdownload",
      buffer: Buffer.from("bad content"),
    });

    await expect(page.getByTestId("file-error")).toBeVisible();
    await expect(page.getByText(/Unsupported file type/)).toBeVisible();
  });


  test("Progress chart displays correct task counts", async ({ page }) => {
    const totalTasks = page.getByTestId("total-tasks");
    await expect(totalTasks).toBeVisible();

    const initialCount = parseInt(await totalTasks.textContent());

    await page.getByPlaceholder("Enter task title...").fill("Chart Test Task");
    await page.getByTestId("add-task-btn").click();

    await expect(totalTasks).toHaveText((initialCount + 1).toString());
  });

  test("Chart updates when a new task is added", async ({ page }) => {
    const totalTasks = page.getByTestId("total-tasks");
    const initialCount = parseInt(await totalTasks.textContent());

    for (let i = 1; i <= 3; i++) {
      await page.getByPlaceholder("Enter task title...").fill(`Chart Task ${i}`);
      await page.getByTestId("add-task-btn").click();
      await page.waitForTimeout(300); // Small delay for socket roundtrip
    }

    await expect(totalTasks).toHaveText((initialCount + 3).toString());
  });

  test("Form resets after successful task creation", async ({ page }) => {
    const titleInput = page.getByPlaceholder("Enter task title...");
    const descInput = page.getByPlaceholder("Describe the task...");

    await titleInput.fill("Reset Test");
    await descInput.fill("Should clear after submit");
    await page.getByTestId("add-task-btn").click();

    await expect(titleInput).toHaveValue("");
    await expect(descInput).toHaveValue("");
  });
});
