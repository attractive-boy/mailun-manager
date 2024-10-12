import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db"; // 假设已配置数据库连接

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id, option_id, question_id, option_label, option_value } = req.body.data;

    try {
      // 检查是否提供了必要的参数
      if (!id || !question_id || !option_label || !option_value) {
        return res.status(400).json({ error: "缺少必要的参数" });
      }

      if (option_id) {
        // 更新已有的选项
        const updatedRows = await db.raw(
          `
            UPDATE zxquestion_options
            SET
              option_label = ?,
              option_value = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
          [option_label, option_value, option_id]
        );

        // 检查是否更新成功
        if (updatedRows[0].affectedRows === 0) {
          return res.status(404).json({ error: "选项未找到，更新失败" });
        }

        res.status(200).json({ code: 200, message: "选项已更新" });
      } else {
        // 插入新选项
        await db.raw(
          `
            INSERT INTO zxquestion_options (question_id, option_label, option_value, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          [question_id, option_label, option_value]
        );

        res.status(201).json({ code: 200, message: "新选项已添加" });
      }
    } catch (error) {
      console.error("添加/更新选项失败:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
