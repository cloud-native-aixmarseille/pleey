export class GraphqlResponseFixtureFactory {
  pending() {
    let respond!: (response: Response) => void;
    let markStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const response = new Promise<Response>((resolve) => {
      respond = resolve;
    });
    return {
      started,
      respond,
      fetch: () => {
        markStarted();
        return response;
      },
    };
  }

  success(data: Record<string, unknown>): Response {
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  failure(code: string, status = 200): Response {
    return new Response(JSON.stringify({ errors: [{ message: code, extensions: { code } }] }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
