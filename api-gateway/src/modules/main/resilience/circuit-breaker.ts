export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreakerOpenError extends Error {
  readonly state: CircuitBreakerState;

  constructor(state: CircuitBreakerState) {
    super('circuit breaker is open');
    this.name = 'CircuitBreakerOpenError';
    this.state = state;
  }
}

export type CircuitBreakerOptions = {
  failureThreshold: number;
  resetTimeoutMs: number;
};

export type CircuitBreakerExecuteOptions<T> = {
  isFailure?: (value: T) => boolean;
};

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private consecutiveFailures = 0;
  private openedAtMs: number | null = null;
  private halfOpenInFlight = false;

  constructor(private readonly options: CircuitBreakerOptions) {}

  getState(): CircuitBreakerState {
    this.refreshState();
    return this.state;
  }

  async execute<T>(
    fn: () => Promise<T>,
    options?: CircuitBreakerExecuteOptions<T>,
  ): Promise<T> {
    this.refreshState();

    if (this.state === 'OPEN') {
      throw new CircuitBreakerOpenError('OPEN');
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenInFlight) {
        throw new CircuitBreakerOpenError('HALF_OPEN');
      }
      this.halfOpenInFlight = true;
    }

    try {
      const value = await fn();
      const failed = options?.isFailure ? options.isFailure(value) : false;
      if (failed) {
        this.onFailure();
      } else {
        this.onSuccess();
      }
      return value;
    } catch (error) {
      this.onFailure();
      throw error;
    } finally {
      this.halfOpenInFlight = false;
    }
  }

  private refreshState(): void {
    if (this.state !== 'OPEN') return;
    if (this.openedAtMs === null) return;

    const now = Date.now();
    const elapsed = now - this.openedAtMs;
    if (elapsed >= this.options.resetTimeoutMs) {
      this.state = 'HALF_OPEN';
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.openedAtMs = null;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    if (this.state === 'HALF_OPEN') {
      this.open();
      return;
    }

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = 'OPEN';
    this.openedAtMs = Date.now();
    this.consecutiveFailures = 0;
  }
}

const breakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  key: string,
  options?: Partial<CircuitBreakerOptions>,
): CircuitBreaker {
  const existing = breakers.get(key);
  if (existing) return existing;

  const failureThresholdRaw =
    options?.failureThreshold ?? Number(process.env.CB_FAILURE_THRESHOLD ?? 5);
  const resetTimeoutMsRaw =
    options?.resetTimeoutMs ??
    Number(process.env.CB_RESET_TIMEOUT_MS ?? 30_000);

  const failureThreshold =
    Number.isFinite(failureThresholdRaw) && failureThresholdRaw > 0
      ? failureThresholdRaw
      : 5;
  const resetTimeoutMs =
    Number.isFinite(resetTimeoutMsRaw) && resetTimeoutMsRaw > 0
      ? resetTimeoutMsRaw
      : 30_000;

  const breaker = new CircuitBreaker({ failureThreshold, resetTimeoutMs });
  breakers.set(key, breaker);
  return breaker;
}
