import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db"; // 假设已配置数据库连接

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id, questionnaire_id = 1, type, question_text, is_required, sort } =
      req.body.data;

    try {
      // 如果存在id，检查数据库中是否有该题目
      let questionExists = false;
      if (id) {
        const [existingQuestion] = await db.raw(
          `SELECT id FROM zxquestions WHERE id = ?`,
          [id]
        );
        questionExists = existingQuestion.length > 0;
      }

      if (questionExists) {
        // 更新题目
        await db.raw(
          `
            UPDATE zxquestions
            SET
              questionnaire_id = ?,
              type = ?,
              question_text = ?,
              is_required = ?,
              sort = ?,  
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
          [questionnaire_id, type, question_text, is_required, sort, id]
        );

        res.status(200).json({ code: 200, message: "题目已更新" });
      } else {
        // 插入新题目
        const [newQuestion] = await db.raw(
          `
            INSERT INTO zxquestions (questionnaire_id, type, question_text, is_required, sort, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
          `,
          [questionnaire_id, type, question_text, is_required, sort]
        );

        const newQuestionId = newQuestion.insertId;

        res.status(201).json({ code: 200, message: "题目已添加", id: newQuestionId });
      }
    } catch (error) {
      console.error("添加/更新题目失败:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
