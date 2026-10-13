import { app } from './app';
import { monitorProviderUsage } from './services/provider-usage-monitor.service';
import type { Bindings } from './types/env';

export default {
  fetch(request, environment, executionContext) {
    return app.fetch(request, environment, executionContext);
  },
  scheduled(_controller, environment, executionContext) {
    executionContext.waitUntil(monitorProviderUsage(environment));
  },
} satisfies ExportedHandler<Bindings>;
