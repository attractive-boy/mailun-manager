// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 获取数据库中的数据
    const result = await db.raw(`
    SELECT 
      q.id AS questionnaire_id,
      q.title,
      q.subtitle,
      q.cover_image,
      JSON_ARRAYAGG(
          JSON_OBJECT(
              'id', qs.id,
              'type', qs.type,
              'question_text', qs.question_text,
              'is_required', qs.is_required,
              'sort', qs.sort,
              'options', COALESCE((
                  SELECT 
                      JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'id', qo.id,
                              'option_label', qo.option_label,
                              'option_value', qo.option_value
                          )
                      )
                  FROM zxquestion_options qo
                  WHERE qo.question_id = qs.id
              ), JSON_ARRAY()) 
          )
      ) AS questions
    FROM 
      zxquestionnaire q
    JOIN 
      zxquestions qs ON q.id = qs.questionnaire_id
    GROUP BY 
      q.id;
    `);

    // 提取结果并处理 questions 列表
    const questionnaires = result[0];

    // 对每个 questionnaire 的 questions 进行排序
    const sortedQuestionnaires = questionnaires.map((q: any) => {
      return {
        ...q,
        questions: q.questions.sort((a: any, b: any) => a.sort - b.sort) // 按 sort 字段排序
      };
    });

    // 返回排序后的数据
    res.status(200).json(sortedQuestionnaires);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
