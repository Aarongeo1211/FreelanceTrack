import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  Filler,
  ArcElement,
  DoughnutController,
  PieController,
} from 'chart.js'

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  Filler,
  ArcElement,
  DoughnutController,
  PieController
)

export { ChartJS }