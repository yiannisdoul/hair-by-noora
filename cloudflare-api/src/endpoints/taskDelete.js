import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";

const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: z.string(),
});

export class TaskDelete extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Delete a Task",
    request: {
      params: z.object({
        taskSlug: Str({ description: "Task slug" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the task was deleted successfully",
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

    // Retrieve the validated slug
    const { taskSlug } = data.params;

    // Implement your own object deletion here

    // Return the deleted task for confirmation
    return {
      result: {
        task: {
          name: "Build something awesome with Cloudflare Workers",
          slug: taskSlug,
          description: "Lorem Ipsum",
          completed: true,
          due_date: "2022-12-24",
        },
      },
      success: true,
    };
  }
}