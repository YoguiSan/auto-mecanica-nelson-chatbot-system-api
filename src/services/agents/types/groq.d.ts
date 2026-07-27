export type IGroqResponse = {
  status: 'completed' | 'in_progress' | 'incomplete';
  output: Array<{
    type: string,
    id: string,
    status: 'completed' | 'in_progress' | 'incomplete',
    role: string,
    content: [
      {
        "type": 'output_text' | string,
        "text": string
        "annotations": [],
        "logprobs": unknown
      }
    ]
  }>
}
