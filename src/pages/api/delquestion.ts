import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db"; // 假设已配置数据库连接

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const { id } = req.query;

    // 检查是否提供了问题 ID
    if (!id) {
      return res.status(400).json({ error: "问题 ID 是必需的" });
    }

    try {
      // 删除问题
      const deletedRows = await db.raw(
        `DELETE FROM zxquestions WHERE id = ?`,
        [id]
      );

      // 返回成功响应
      res.status(200).json({ code: 200, message: "问题已删除" });
    } catch (error) {
      console.error("删除问题失败:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
