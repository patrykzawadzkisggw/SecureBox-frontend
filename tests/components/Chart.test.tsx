import { render, screen } from '@testing-library/react';
import { Chart, chartConfig } from '@/components/Chart';
import { ChartData } from '@/lib/interfaces';


beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });
  


jest.mock('recharts', () => ({
  Bar: jest.fn(({ children, ...props }) => (
    <div data-testid="bar" {...props}>
      {children}
    </div>
  )),
  BarChart: jest.fn(({ children, data, ...props }) => (
    <div
      data-testid="bar-chart"
      data={JSON.stringify(data)}
      {...props}
    >
      {children}
    </div>
  )),
  CartesianGrid: jest.fn((props) => <div data-testid="cartesian-grid" {...props} />),
  LabelList: jest.fn((props) => <div data-testid="label-list" {...props} />),
  XAxis: jest.fn((props) => <div data-testid="x-axis" {...props} />),
}));

jest.mock('@/components/ui/chart', () => ({
  ChartContainer: jest.fn(({ children, config, className }) => (
    <div
      data-testid="chart-container"
      className={className}
      data-config={JSON.stringify(config)}
    >
      {children}
    </div>
  )),
  ChartTooltip: jest.fn(({ children, ...props }) => (
    <div data-testid="chart-tooltip" {...props}>
      {children}
    </div>
  )),
  ChartTooltipContent: jest.fn((props) => (
    <div data-testid="chart-tooltip-content" {...props} />
  )),
}));

describe('Komponent Chart', () => {
  const mockUser: any = {
    first_name: 'Patryk',
    id: '67eb5b5d-4b18-482c-a338-f761e5086811',
    last_name: 'Zawadzki',
    login: 'user123@gmail.com',
  };
  const mockChartData: ChartData[] = [
    { month: 'Poniedziałek', logins: 5 },
    { month: 'Wtorek', logins: 10 },
  ];


  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('renderuje komunikat "Zaloguj się" gdy użytkownik jest null', () => {
    render(<Chart user={null} chartData={mockChartData} hasFetched={true} />);

    expect(
      screen.getByText('Zaloguj się, aby zobaczyć wykres.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
  });


  it('renderuje komunikat "Ładowanie..." gdy hasFetched jest false', () => {
    render(<Chart user={mockUser} chartData={mockChartData} hasFetched={false} />);

    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
  });

  it('renderuje wykres słupkowy z poprawnymi danymi gdy użytkownik jest zalogowany i dane są pobrane', () => {
    render(<Chart user={mockUser} chartData={mockChartData} hasFetched={true} />);

    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass('select-none');
    expect(chartContainer).toHaveAttribute(
      'data-config',
      JSON.stringify(chartConfig)
    );

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
    expect(barChart).toHaveAttribute('data', JSON.stringify(mockChartData));
    expect(screen.getByTestId('x-axis')).toHaveAttribute('dataKey', 'month');
    expect(screen.getByTestId('bar')).toHaveAttribute('dataKey', 'logins');
    expect(screen.getByTestId('label-list')).toHaveAttribute('position', 'top');
    expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
  });

  it('renderuje wykres z pustymi danymi bez błędów', () => {
    render(<Chart user={mockUser} chartData={[]} hasFetched={true} />);

    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toHaveAttribute(
      'data',
      JSON.stringify([])
    );
  });

  it('przekazuje poprawną konfigurację chartConfig do ChartContainer', () => {
    render(<Chart user={mockUser} chartData={mockChartData} hasFetched={true} />);

    const chartContainer = screen.getByTestId('chart-container');
    expect(chartContainer).toHaveAttribute(
      'data-config',
      JSON.stringify(chartConfig)
    );
    expect(chartConfig.logins.label).toBe('Logowania');
    expect(chartConfig.logins.color).toBe('hsl(var(--chart-1))');
  });
});