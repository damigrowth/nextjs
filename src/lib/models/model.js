"use server";

import { getData } from "../api";

export async function fetchModel(model, query) {
  try {
    const res = await getData(query);

    const data = res.data;
    console.log(model, data);
    const meta = res.meta;

    return { [model]: data, ...meta };
  } catch (error) {
    console.error(`${model} error. Please try again later.`, error);
    return { error: `${model} error. Please try again later.` };
  }
}
