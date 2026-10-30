import { $api } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/** Technical page: proves the chain web → /api proxy → backend → database and RabbitMQ works. */
export function SystemPage() {
  // A diagnostic page: show a failure at once instead of retrying, and keep polling.
  const status = $api.useQuery(
    "get",
    "/system/status",
    {},
    { refetchInterval: 5_000, retry: false },
  );

  return (
    <main className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Состояние системы</CardTitle>
          <CardDescription>Ответ backend на GET /api/system/status</CardDescription>
        </CardHeader>
        <CardContent>
          {status.isPending ? (
            <output>Загрузка…</output>
          ) : status.isError ? (
            <p role="alert" className="text-destructive">
              Backend недоступен: {describeError(status.error)}
            </p>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className="text-muted-foreground">Сервис</dt>
              <dd>
                {status.data.service} {status.data.version}
              </dd>
              <dt className="text-muted-foreground">Время сервера</dt>
              <dd>{new Date(status.data.serverTime).toLocaleString()}</dd>
              <dt className="text-muted-foreground">База данных</dt>
              <dd>
                <DependencyState state={status.data.dependencies.database} />
              </dd>
              <dt className="text-muted-foreground">RabbitMQ</dt>
              <dd>
                <DependencyState state={status.data.dependencies.rabbitmq} />
              </dd>
            </dl>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function DependencyState({ state }: { state: "ok" | "unavailable" }) {
  return (
    <span className={cn(state === "ok" ? "text-success" : "text-destructive")}>
      {state === "ok" ? "доступна" : "недоступна"}
    </span>
  );
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : "неожиданный ответ";
}
