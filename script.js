let currentPrice = 0
let chart = null

document.addEventListener('DOMContentLoaded', function () {
  const user = localStorage.getItem('currentUser') || 'Трейдер'
  document.getElementById('currentUser').textContent = user
  updateTime()
  calculateTon()
  initChart()
  loadRealTimeData()

  //  каждые х секунд
  setInterval(loadRealTimeData, 15000)
})

function logout() {
  localStorage.removeItem('currentUser')
  window.location.href = 'index.html'
}

function updateTime() {
  const now = new Date()
  const timeString = now.toLocaleTimeString('ru-RU')
  document.getElementById('lastUpdate').textContent = timeString
}

function calculateTon() {
  const usdValue = parseFloat(document.getElementById('usdInput').value) || 0
  const tonValue = usdValue / currentPrice

  document.getElementById('tonInput').value = tonValue.toFixed(6)
  updateCalculationResult(usdValue, tonValue)
}

function calculateUsd() {
  const tonValue = parseFloat(document.getElementById('tonInput').value) || 0
  const usdValue = tonValue * currentPrice

  document.getElementById('usdInput').value = usdValue.toFixed(2)
  updateCalculationResult(usdValue, tonValue)
}

function updateCalculationResult(usd, ton) {
  document.getElementById('calculationResult').textContent = `${usd.toFixed(
    2
  )} USD = ${ton.toFixed(6)} TON`
}
function initChart() {
  const ctx = document.getElementById('priceChart').getContext('2d')
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'TON/USDT',
          data: [],
          borderColor: '#00c6ff',
          backgroundColor: 'rgba(0, 198, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#888',
            callback: function (value) {
              return '$' + value.toFixed(2)
            },
          },
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#888',
            maxTicksLimit: 6,
          },
        },
      },
    },
  })
}
async function loadRealTimeData() {
  try {
    // Пробуем Binance API сначала
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT'
    )
    const data = await response.json()

    // Получаем текущую цену
    currentPrice = parseFloat(data.price)

    // Обновляем отображение
    updatePriceDisplay(currentPrice)

    // Загружаем исторические данные для графика
    await loadChartData()

    // Обновляем статистику
    updateStatsWithCurrentPrice()
  } catch (error) {
    console.log('Binance API не доступен, пробуем CoinGecko')
    try {
      // Fallback на CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd'
      )
      const data = await response.json()

      currentPrice = data['the-open-network'].usd
      updatePriceDisplay(currentPrice)
      await loadChartData()
      updateStatsWithCurrentPrice()
    } catch (error2) {
      console.log('Все API недоступны, используем демо-данные')
      loadDemoData()
    }
  }
}

// Загрузка данных для графика
async function loadChartData() {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/klines?symbol=TONUSDT&interval=1h&limit=24'
    )
    const data = await response.json()

    const prices = data.map(candle => parseFloat(candle[4])) // Цена закрытия
    const times = data.map(candle => {
      const date = new Date(candle[0])
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    })

    if (chart) {
      chart.data.labels = times
      chart.data.datasets[0].data = prices
      chart.update('none')
    }
  } catch (error) {
    console.log('Не удалось загрузить данные графика')
  }
}

// Обновление статистики с текущей ценой
function updateStatsWithCurrentPrice() {
  // Для демо-статистики (в реальном приложении нужно брать из API)
  const change24h = ((Math.random() - 0.3) * 10).toFixed(1)
  const volume = (currentPrice * 1500000).toFixed(0)
  const high24h = (currentPrice * (1 + Math.random() * 0.1)).toFixed(2)
  const low24h = (currentPrice * (1 - Math.random() * 0.1)).toFixed(2)

  document
    .querySelectorAll('.stat-item')[0]
    .querySelector('.stat-value').textContent = `${
    change24h > 0 ? '+' : ''
  }${change24h}%`
  document
    .querySelectorAll('.stat-item')[1]
    .querySelector('.stat-value').textContent = `$${volume}M`
  document
    .querySelectorAll('.stat-item')[2]
    .querySelector('.stat-value').textContent = `$${high24h}`
  document
    .querySelectorAll('.stat-item')[3]
    .querySelector('.stat-value').textContent = `$${low24h}`
}

function updatePriceDisplay(price) {
  const priceElement = document.getElementById('tonPrice')
  const changeElement = document.querySelector('.change')

  priceElement.textContent = price.toFixed(2)

  const changePercent = (((price - 2.0) / 2.0) * 100).toFixed(1)

  if (changePercent > 0) {
    changeElement.textContent = `+${changePercent}%`
    changeElement.className = 'change change-positive'
  } else {
    changeElement.textContent = `${changePercent}%`
    changeElement.className = 'change change-negative'
  }
}

function updateStats(prices) {
  const high24h = Math.max(...prices)
  const low24h = Math.min(...prices)
  const volume = (currentPrice * 1000000).toFixed(0)

  document
    .querySelectorAll('.stat-item')[0]
    .querySelector('.stat-value').textContent = `+${(
    ((currentPrice - prices[0]) / prices[0]) *
    100
  ).toFixed(1)}%`
  document
    .querySelectorAll('.stat-item')[1]
    .querySelector('.stat-value').textContent = `$${volume}M`
  document
    .querySelectorAll('.stat-item')[2]
    .querySelector('.stat-value').textContent = `$${high24h.toFixed(2)}`
  document
    .querySelectorAll('.stat-item')[3]
    .querySelector('.stat-value').textContent = `$${low24h.toFixed(2)}`
}

function loadDemoData() {
  const prices = []
  const times = []
  const basePrice = 2.0 + (Math.random() - 0.5) * 0.5

  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.5) * 0.08
    prices.push(basePrice * (1 + change))

    const time = new Date()
    time.setHours(time.getHours() - 24 + i)
    times.push(
      time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    )
  }

  currentPrice = prices[prices.length - 1]
  updatePriceDisplay(currentPrice)
  updateStats(prices)

  if (chart) {
    chart.data.labels = times
    chart.data.datasets[0].data = prices
    chart.update('none')
  }
}

setInterval(updateTime, 1000)
