export const learningPaths = [
  {
    id: "1",
    title: "Frontend Development Mastery",
    description:
      "Become a professional frontend developer with React, Next.js, and Tailwind CSS.",
    thumbnail: "/placeholder-frontend.jpg",
    progress: 0,
    totalModules: 5,
    completedModules: 0,
  },
  {
    id: "2",
    title: "Backend Engineering with Go",
    description:
      "Master backend development using Golang, PostgreSQL, and Docker.",
    thumbnail: "/placeholder-backend.jpg",
    progress: 35,
    totalModules: 8,
    completedModules: 2,
  },
];

export const modules = {
  "1": [
    {
      id: "m1",
      title: "Introduction to Web",
      isLocked: false,
      isCompleted: true,
    },
    {
      id: "m2",
      title: "HTML & CSS Basics",
      isLocked: false,
      isCompleted: false,
    },
    {
      id: "m3",
      title: "JavaScript Fundamentals",
      isLocked: true,
      isCompleted: false,
    },
    { id: "m4", title: "React Essentials", isLocked: true, isCompleted: false },
    {
      id: "m5",
      title: "Next.js Framework",
      isLocked: true,
      isCompleted: false,
    },
  ],
  "2": [
    { id: "m1", title: "Go Syntax", isLocked: false, isCompleted: true },
    { id: "m2", title: "Concurrency", isLocked: false, isCompleted: true },
    { id: "m3", title: "HTTP Servers", isLocked: false, isCompleted: false },
  ],
};
