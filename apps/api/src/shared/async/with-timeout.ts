class TimeoutError extends Error {
  override readonly name = "TimeoutError";
}

export async function withTimeout<Result>(
  operation: Promise<Result>,
  milliseconds: number,
): Promise<Result> {
  const { promise: timeout, reject } = Promise.withResolvers<never>();
  const timer = setTimeout(() => {
    reject(new TimeoutError(`timed out after ${milliseconds} ms`));
  }, milliseconds);
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
