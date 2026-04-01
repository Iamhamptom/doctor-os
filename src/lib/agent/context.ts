// Practice context for the current request
// Set before tool execution in the API route

let _practiceId = "demo-practice";

export function setPracticeId(id: string) {
  _practiceId = id;
}

export function getPracticeId(): string {
  return _practiceId;
}
