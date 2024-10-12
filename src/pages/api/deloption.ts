// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  console.log(req.query);
  const { optionId } = req.query; // 假设从查询参数中获取选项 ID
  

  if (!optionId) {
    return res.status(400).json({ error: "Option ID is required" });
  }

  try {
    // 删除选项
    const deletedRows = await db("zxquestion_options")
      .where("id", optionId)
      .del();


    // 返回成功响应
    res.status(200).json({ code: 200, message: "Option deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
