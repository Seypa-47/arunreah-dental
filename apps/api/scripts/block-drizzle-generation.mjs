console.error(
  'Migration generation is disabled: versioned SQL in apps/api/migrations is authoritative. ' +
    'Add a reviewed, forward-only SQL migration with the next numeric prefix; never generate from the historical Drizzle 0008 snapshot.',
);
process.exitCode = 1;
