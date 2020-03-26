export function Object2constStatements(rootState: {}) {
  const constStatements = Object.keys(rootState || {})
    .filter(k => typeof rootState[k] !== "object")
    .map(k => {
      const value = rootState[k];
      return `var ${k} = "${value}";`;
    })
    .reduce((prev, cur) => {
      return prev + cur;
    }, "");
  return constStatements;
}
