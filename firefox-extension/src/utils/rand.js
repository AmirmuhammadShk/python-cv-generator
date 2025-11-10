// path: src/utils/rand.js
export const randomDelayMs = () => (Math.floor(Math.random() * 3) + 1) * 1000;

export function randomPrompt(contextHeader) {
  const pts = [
    "Results-driven developer with proven delivery across web platforms.",
    "Strong CI/CD, testing, and observability practices.",
    "Collaborates well with cross-functional stakeholders.",
    "Hands-on with JS/TS, modern frameworks, and cloud-native tooling.",
    "Focus on clean code, performance, and maintainability.",
    "Enjoys mentoring, docs, and knowledge sharing."
  ];
  const rand = (n) => Math.floor(Math.random() * n);
  const count = 5 + rand(4);
  const bullets = Array.from({ length: count }, () => pts[rand(pts.length)]);
  return (contextHeader ? contextHeader + "\n\n" : "") + "• " + bullets.join("\n• ");
}
