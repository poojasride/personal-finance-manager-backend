import { Parser } from "json2csv";

export const exportCSV = (data) => {

  const fields = [
    "title",
    "description",
    "amount",
    "type",
    "category",
    "date",
    "isRecurring",
    "recurringInterval"
  ];

  const parser = new Parser({ fields });

  return parser.parse(data);
};