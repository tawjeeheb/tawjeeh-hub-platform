export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (/^[./]/.test(specifier) && !specifier.endsWith(".ts")) {
      return await nextResolve(specifier + ".ts", context);
    }
    throw err;
  }
}
