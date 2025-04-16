let rainfallChartInstance = null;
let importanceChartInstance = null;

const chartColors = {
    primary: 'rgba(124, 154, 255, 0.7)',
    primaryBorder: 'rgba(124, 154, 255, 1)',
    secondary: 'rgba(148, 216, 201, 0.7)',
    secondaryBorder: 'rgba(148, 216, 201, 1)',
    accent: 'rgba(255, 166, 158, 0.7)',
    accentBorder: 'rgba(255, 166, 158, 1)'
};


function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.opacity = '0';
        setTimeout(() => {
            tab.classList.add('hidden');
        }, 300);
    });


    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'text-blue-600', 'border-blue-600');
        btn.classList.add('text-gray-600');
    });


    setTimeout(() => {
        const selectedTab = document.getElementById(tabName);
        selectedTab.classList.remove('hidden');
        setTimeout(() => {
            selectedTab.style.opacity = '1';
        }, 50);
    }, 300);


    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active', 'text-blue-600', 'border-blue-600');


    if (tabName === 'data') loadDataInfo();
    if (tabName === 'visualize') loadFeatureImportance();
}

async function loadDataInfo() {
    try {
        const dataInfo = document.getElementById('data-info');
        
        dataInfo.innerHTML = `
            <div class="flex items-center justify-center w-full p-8">
                <div class="animate-pulse text-blue-600">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
                <p class="ml-2">Đang tải dữ liệu...</p>
            </div>
        `;
        
        const response = await fetch('http://localhost:8000/data-info');
        if (!response.ok) throw new Error('Không thể lấy dữ liệu từ API');
        const data = await response.json();
        
        dataInfo.innerHTML = `
            <div class="stat-card">
                <p><strong>Số dòng dữ liệu</strong> <span class="value-counter">${data.total_rows}</span></p>
            </div>
            <div class="stat-card">
                <p><strong>Lượng mưa trung bình</strong> <span class="value-counter">${data.rainfall_mean.toFixed(2)}</span> mm</p>
            </div>
            <div class="stat-card">
                <p><strong>Khoảng lượng mưa</strong> <span>${data.rainfall_range[0].toFixed(2)} - ${data.rainfall_range[1].toFixed(2)}</span> mm</p>
            </div>
            <div class="stat-card">
                <p><strong>Tỷ lệ lũ</strong> <span class="percentage-counter">${(data.flood_ratio * 100).toFixed(2)}</span>%</p>
            </div>
        `;

        animateCounters();

        const rainfallResponse = await fetch('http://localhost:8000/rainfall-distribution');
        if (!rainfallResponse.ok) throw new Error('Không thể lấy dữ liệu Rainfall');
        const rainfallData = await rainfallResponse.json();
        const ctx = document.getElementById('rainfallChart').getContext('2d');

        if (rainfallChartInstance) rainfallChartInstance.destroy();

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, chartColors.primary);
        gradient.addColorStop(1, 'rgba(124, 154, 255, 0.1)');

        rainfallChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: rainfallData.bins.slice(0, -1).map(b => b.toFixed(2)),
                datasets: [{
                    label: 'Phân bố lượng mưa',
                    data: rainfallData.counts,
                    backgroundColor: gradient,
                    borderColor: chartColors.primaryBorder,
                    borderWidth: 1,
                    borderRadius: 5,
                    hoverBackgroundColor: chartColors.primaryBorder
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 12
                            }
                        },
                        title: { 
                            display: true, 
                            text: 'Số lần',
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 14,
                                weight: 'bold'
                            }
                        } 
                    },
                    x: { 
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 12
                            },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        title: { 
                            display: true, 
                            text: 'Lượng mưa (mm)',
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 14,
                                weight: 'bold'
                            }
                        } 
                    }
                },
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 14
                            },
                            usePointStyle: true,
                            pointStyle: 'rect'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        titleColor: '#45536a',
                        bodyColor: '#45536a',
                        borderColor: '#7c9aff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        padding: 12,
                        titleFont: {
                            family: "'Quicksand', sans-serif",
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Quicksand', sans-serif",
                            size: 13
                        },
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Lượng mưa: ${tooltipItems[0].label} mm`;
                            },
                            label: function(context) {
                                return `Số lần xuất hiện: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        document.getElementById('data-info').innerHTML = `
            <div class="error-message">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>Lỗi: ${error.message}</p>
            </div>
        `;
    }
}

async function loadFeatureImportance() {
    try {
        const visualizeContainer = document.getElementById('visualize');
        visualizeContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Tầm quan trọng của Đặc trưng</h2>
            <div class="bg-white p-4 rounded-lg shadow-md flex items-center justify-center" style="min-height: 300px;">
                <div class="animate-pulse text-blue-600">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
                <p class="ml-2">Đang tải dữ liệu...</p>
            </div>
        `;
        
        const response = await fetch('http://localhost:8000/feature-importance');
        if (!response.ok) throw new Error('Không thể lấy dữ liệu Feature Importance');
        const data = await response.json();
        

        const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const labels = sortedEntries.map(([key]) => key);
        const values = sortedEntries.map(([_, value]) => value);
        
        visualizeContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Tầm quan trọng của Đặc trưng</h2>
            <canvas id="importanceChart" class="bg-white p-4 rounded-lg shadow-md"></canvas>
            <div class="mt-6 bg-white p-4 rounded-lg shadow-md">
                <h3 class="font-bold text-lg mb-2 text-primary-color">Phân tích đặc trưng</h3>
                <p class="text-gray-700">Biểu đồ trên hiển thị tầm quan trọng của từng đặc trưng trong việc dự đoán rủi ro lũ lụt. Các đặc trưng có giá trị cao hơn có ảnh hưởng nhiều hơn đến kết quả dự đoán.</p>
            </div>
        `;
        
        const ctx = document.getElementById('importanceChart').getContext('2d');

        if (importanceChartInstance) importanceChartInstance.destroy();
        
        const backgroundColors = labels.map((_, index) => {
            const hue = 210 + (index * 15) % 60; 
            return `hsla(${hue}, 85%, 75%, 0.7)`;
        });
        
        const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

        importanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(label => formatFeatureName(label)),
                datasets: [{
                    label: 'Tầm quan trọng',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                scales: {
                    x: { 
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 12
                            }
                        },
                        title: { 
                            display: true, 
                            text: 'Tầm quan trọng',
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 14,
                                weight: 'bold'
                            }
                        } 
                    },
                    y: { 
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 12
                            }
                        },
                        title: { 
                            display: true, 
                            text: 'Đặc trưng',
                            font: {
                                family: "'Quicksand', sans-serif",
                                size: 14,
                                weight: 'bold'
                            }
                        } 
                    }
                },
                plugins: {
                    legend: { 
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        titleColor: '#45536a',
                        bodyColor: '#45536a',
                        borderColor: '#7c9aff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        padding: 12,
                        titleFont: {
                            family: "'Quicksand', sans-serif",
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Quicksand', sans-serif",
                            size: 13
                        },
                        callbacks: {
                            title: function(tooltipItems) {
                                return formatFeatureName(labels[tooltipItems[0].dataIndex]);
                            },
                            label: function(context) {
                                return `Tầm quan trọng: ${context.raw.toFixed(4)}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        document.getElementById('visualize').innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Tầm quan trọng của Đặc trưng</h2>
            <div class="error-message">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>Lỗi: ${error.message}</p>
            </div>
        `;
    }
}


function formatFeatureName(name) {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}


function animateCounters() {
    document.querySelectorAll('.value-counter').forEach(counter => {
        const target = parseFloat(counter.textContent);
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = current.toFixed(2);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toFixed(2);
            }
        };
        
        updateCounter();
    });
    
    document.querySelectorAll('.percentage-counter').forEach(counter => {
        const target = parseFloat(counter.textContent);
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = current.toFixed(2);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toFixed(2);
            }
        };
        
        updateCounter();
    });
}

function addHoverEffects() {
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover-effect');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover-effect');
        });
    });
}


function showPredictionResult(isFlood, probability) {
    const resultElement = document.getElementById('predict-result');
    

    let color, bgColor, icon;
    if (probability >= 0.7) {
        color = '#e53e3e'; 
        bgColor = '#fff5f5';
        icon = 'warning';
    } else if (probability >= 0.3) {
        color = '#dd6b20'; 
        bgColor = '#fffaf0';
        icon = 'alert';
    } else {
        color = '#38a169'; 
        bgColor = '#f0fff4';
        icon = 'check';
    }
    
    let iconSvg = '';
    if (icon === 'warning') {
        iconSvg = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>`;
    } else if (icon === 'alert') {
        iconSvg = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`;
    } else {
        iconSvg = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`;
    }
    
    resultElement.style.backgroundColor = bgColor;
    resultElement.style.borderLeftColor = color;
    
    resultElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0 mt-1" style="color: ${color}">
                ${iconSvg}
            </div>
            <div class="ml-3">
                <h3 class="text-lg font-medium" style="color: ${color}">
                    ${isFlood ? 'Có khả năng xảy ra lũ' : 'Khả năng xảy ra lũ thấp'}
                </h3>
                <div class="mt-2">
                    <p class="text-gray-700">Xác suất lũ: <span class="font-semibold" style="color: ${color}">${(probability * 100).toFixed(2)}%</span></p>
                    <div class="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div class="h-2.5 rounded-full" style="width: ${probability * 100}%; background-color: ${color}; transition: width 1s ease-in-out;"></div>
                    </div>
                    <p class="mt-3 text-sm text-gray-600">
                        ${getRecommendation(probability)}
                    </p>
                </div>
            </div>
        </div>
    `;
}


function getRecommendation(probability) {
    if (probability >= 0.7) {
        return 'Khuyến nghị: Cần cảnh báo người dân và chuẩn bị phương án di tản khẩn cấp nếu cần thiết.';
    } else if (probability >= 0.3) {
        return 'Khuyến nghị: Theo dõi dự báo thời tiết và chuẩn bị phương án ứng phó.';
    } else {
        return 'Khuyến nghị: Rủi ro lũ lụt thấp, tiếp tục theo dõi diễn biến thời tiết.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    
    const style = document.createElement('style');
    style.textContent = `
        .tab-content {
            transition: opacity 0.3s ease;
        }
        .stat-card {
            background-color: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(124, 154, 255, 0.2);
        }
        .hover-effect {
            background-color: #f0f7ff;
        }
        .error-message {
            display: flex;
            align-items: center;
            padding: 1rem;
            background-color: #fff5f5;
            border-radius: 8px;
            border-left: 4px solid #e53e3e;
        }
    `;
    document.head.appendChild(style);

    const form = document.getElementById('predict-form');
    if (!form) {
        console.error('Không tìm thấy form với id "predict-form".');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            rainfall_mm: parseFloat(formData.get('rainfall_mm')),
            temperature_c: parseFloat(formData.get('temperature_c')),
            humidity_percent: parseFloat(formData.get('humidity_percent')),
            river_discharge_m3s: parseFloat(formData.get('river_discharge_m3s')),
            water_level_m: parseFloat(formData.get('water_level_m')),
            elevation_m: parseFloat(formData.get('elevation_m')),
            land_cover: formData.get('land_cover'),
            soil_type: formData.get('soil_type'),
            population_density: parseFloat(formData.get('population_density')),
            infrastructure: parseInt(formData.get('infrastructure')),
            historical_floods: parseInt(formData.get('historical_floods'))
        };

        const invalidFields = [];
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && isNaN(value))) {
                invalidFields.push(key);
            }
        }

        if (invalidFields.length > 0) {
            document.getElementById('predict-result').innerHTML = `
                <div class="error-message">
                    <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div class="ml-3">
                        <p class="font-medium text-red-500">Lỗi: Vui lòng điền đầy đủ thông tin</p>
                        <ul class="mt-1 text-sm text-red-400 list-disc list-inside">
                            ${invalidFields.map(field => `<li>${formatFeatureName(field)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            

            invalidFields.forEach(field => {
                const input = form.querySelector(`[name="${field}"]`);
                if (input) {
                    input.classList.add('border-red-500');
                    input.addEventListener('input', function() {
                        this.classList.remove('border-red-500');
                    }, { once: true });
                }
            });
            
            return;
        }

        try {
 
            const resultElement = document.getElementById('predict-result');
            resultElement.innerHTML = `
                <div class="flex items-center justify-center p-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="ml-2 text-blue-600">Đang xử lý dự đoán...</p>
                </div>
            `;

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Không thể dự đoán');
            }
            
            const result = await response.json();
            

            showPredictionResult(result.prediction, result.probability);
            
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.classList.add('bg-green-600');
            setTimeout(() => {
                submitButton.classList.remove('bg-green-600');
            }, 1000);
            
        } catch (error) {
            console.error(error);
            document.getElementById('predict-result').innerHTML = `
                <div class="error-message">
                    <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="ml-2">Lỗi: ${error.message}</p>
                </div>
            `;
        }
    });


    document.querySelectorAll('#predict-form input, #predict-form select').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
    });


    openTab('data');
    

    setTimeout(addHoverEffects, 1000);
});