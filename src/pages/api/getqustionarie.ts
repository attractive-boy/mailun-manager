import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db"; // 假设已配置数据库连接

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // 获取 current=6&pageSize=5&startTime=2024-10-02&endTime=2024-11-06
    const current = parseInt(req.query.current as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 5;
    const startTime = req.query.startTime as string; // 开始时间
    const endTime = req.query.endTime as string; // 结束时间

    try {
      // 分页查询 responses 表，获取指定页的数据
      const query = db("responses")
        .innerJoin(
          "zxuser_answers",
          "responses.id",
          "zxuser_answers.response_id"
        )
        .distinct("responses.id") // 去重，确保只返回唯一的 response_id
        .limit(pageSize)
        .offset((current - 1) * pageSize);

      // 如果提供了时间范围，添加到查询条件中
      if (startTime) {
        query.where("responses.completion_time", ">=", new Date(startTime));
      }
      if (endTime) {
        query.where("responses.completion_time", "<=", new Date(endTime));
      }

      const responses = await query;

      // 获取总数 count
      const totalQuery = db("responses")
        .innerJoin(
          "zxuser_answers",
          "responses.id",
          "zxuser_answers.response_id"
        )
        .distinct("responses.id");

      // 如果提供了时间范围，添加到查询条件中
      if (startTime) {
        totalQuery.where("responses.completion_time", ">=", new Date(startTime));
      }
      if (endTime) {
        totalQuery.where("responses.completion_time", "<=", new Date(endTime));
      }

      const total = await totalQuery;
      const totalCount = total.length;

      // 提取所有的 response_id
      const responseIds = responses.map((response) => response.id);
      if (responseIds.length === 0) {
        return res.status(200).json([]); // 如果没有数据，返回空数组
      }

      // 查询 zxuser_answers 并进行多条件 leftJoin
      const answers = await db("zxuser_answers")
        .leftJoin("zxquestion_options", function () {
          this.on(
            "zxuser_answers.question_id",
            "=",
            "zxquestion_options.question_id"
          ).andOn(
            "zxuser_answers.answer_value",
            "=",
            "zxquestion_options.option_value"
          ); // 添加更多条件
        })
        .whereIn("zxuser_answers.response_id", responseIds)
        .distinct("zxuser_answers.*", "zxquestion_options.option_label");

      const groupedData: any = {};

      answers.forEach((answer) => {
        const respId = answer.response_id;
        const quesId = answer.question_id;
        const value = answer.option_label
          ? answer.option_label
          : answer.answer_value;

        if (!groupedData[respId]) {
          groupedData[respId] = {};
        }

        if (groupedData[respId]["q" + quesId] === undefined) {
          // 如果该 question_id 还没有值，直接赋值
          groupedData[respId]["q" + quesId] = value;
        }
        if (groupedData[respId]["created_at"] === undefined) {
          // 如果该 question_id 已经有值，则合并
          groupedData[respId]["created_at"] = answer.created_at;
        }
        if (groupedData[respId]["id"] === undefined) {
          // 如果该 question_id 已经有值，则合并
          groupedData[respId]["id"] = answer.response_id;
        }
      });

      const result_data = Object.values(groupedData);

      return res.status(200).json({
        data: result_data,
        page: current,
        total: totalCount,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching answers:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
