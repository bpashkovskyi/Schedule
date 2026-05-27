# Schedule (NUNG) — ASP.NET Core MVC

Веб-додаток для перегляду розкладу занять НУНГ на **ASP.NET Core MVC** з інтеграцією **Dekanat.ScheduleSdk**.

Детальніше про UI/функціонал — у `Schedule.Web/README.md`.

## Рішення

- `Schedule.sln` — класичний Visual Studio solution
- `Schedule.slnx` — XML solution (створюється `dotnet new sln` за замовчуванням у .NET SDK 10)

Проєкти:

- `Schedule.Web/Schedule.Web.csproj`
- `Schedule.UnitTests/Schedule.UnitTests.csproj`

## Вимоги

- .NET SDK **10.0.201** (або сумісний .NET 10)

## Запуск

```bash
dotnet run --project Schedule.Web
```

## Тести

```bash
dotnet test Schedule.slnx
```

## Ліцензія

MIT — див. `LICENSE`.

