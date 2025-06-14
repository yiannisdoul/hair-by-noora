import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: z.string(),
});

export class TaskFetch extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Get a single Task by slug",
    request: {
      params: z.object({
        taskSlug: Str({ description: "Task slug" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a single task if found",
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
      "404": {
        description: "Task not found",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                error: Str(),
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

    // Retrieve the validated slug
    const { taskSlug } = data.params;

    // Implement your own object fetch here
    const exists = true;

    if (exists === false) {
      return Response.json(
        {
          success: false,
          error: "Object not found",
        },
        {
          status: 404,
        }
      );
    }

    return {
      success: true,
      task: {
        name: "my task",
        slug: taskSlug,
        description: "this needs to be done",
        completed: false,
        due_date: new Date().toISOString().slice(0, 10),
      },
    };
  }
}