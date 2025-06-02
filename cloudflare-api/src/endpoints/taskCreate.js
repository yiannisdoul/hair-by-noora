import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: z.string(),
});

export class TaskCreate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Create a new Task",
    request: {
      body: {
        content: {
          "application/json": {
            schema: Task,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created task",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  task: Task,
                }),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    // Get validated data
    const data = await this.getValidatedData();

    // Retrieve the validated request body
    const taskToCreate = data.body;

    // Implement your own object insertion here

    // return the new task
    return {
      success: true,
      task: {
        name: taskToCreate.name,
        slug: taskToCreate.slug,
        description: taskToCreate.description,
        completed: taskToCreate.completed,
        due_date: taskToCreate.due_date,
      },
    };
  }
}