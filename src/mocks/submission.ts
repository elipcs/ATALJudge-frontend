export interface SubmissionMock {
  id: string;
  userId: string;
  userName: string;
  problemLetter: string;
  result: string;
  time: number;
  memory: number;
  language: string;
  codeLength: number;
  submittedAt: string;
}

export const mockSubmissions: SubmissionMock[] = [
  {
    id: "53835920",
    userId: "1",
    userName: "joaod",
    problemLetter: "D",
    result: "Time limit",
    time: 1521,
    memory: 35.5,
    language: "Python",
    codeLength: 896,
    submittedAt: "2024-08-20T10:00:00Z"
  },
  {
    id: "53832975",
    userId: "1",
    userName: "joaod",
    problemLetter: "A",
    result: "Accepted",
    time: 93,
    memory: 0.7,
    language: "Python",
    codeLength: 113,
    submittedAt: "2024-08-20T09:30:00Z"
  },
  {
    id: "53832977",
    userId: "1",
    userName: "joaod",
    problemLetter: "B",
    result: "Accepted",
    time: 77,
    memory: 0.7,
    language: "Python",
    codeLength: 673,
    submittedAt: "2024-08-20T09:40:00Z"
  },
  {
    id: "53833259",
    userId: "1",
    userName: "joaod",
    problemLetter: "C",
    result: "Accepted",
    time: 296,
    memory: 35.5,
    language: "Python",
    codeLength: 896,
    submittedAt: "2024-08-20T09:50:00Z"
  },
  {
    id: "53833468",
    userId: "1",
    userName: "joaod",
    problemLetter: "D",
    result: "Runtime error on",
    time: 1554,
    memory: 0.0,
    language: "Python",
    codeLength: 1554,
    submittedAt: "2024-08-20T10:10:00Z"
  }
];
