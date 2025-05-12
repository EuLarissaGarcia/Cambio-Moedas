
let exchangeRates = {};
let lastUpdate = null;
let currentBaseCurrency = 'USD';


document.addEventListener('DOMContentLoaded', function() {
    initializeConverter();
});

function initializeConverter() {
   
    loadExchangeRates(currentBaseCurrency);
    
   
    setupEventListeners();
}

function setupEventListeners() {
    
    document.querySelector('.convert-btn').addEventListener('click', convertCurrency);
    
    
    document.getElementById('amount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') convertCurrency();
    });
    
   
    document.getElementById('fromCurrency').addEventListener('change', handleCurrencyChange);
    
    
    document.getElementById('toCurrency').addEventListener('change', function() {
        if (document.getElementById('amount').value.trim()) {
            convertCurrency();
        }
    });
    
   
    document.querySelector('.swap-btn').onclick = swapCurrencies;
}

async function loadExchangeRates(baseCurrency) {
    try {
        showLoader(true);
        
        const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result !== 'success') {
            throw new Error('Resposta da API não foi bem-sucedida');
        }
        
        exchangeRates = data.rates;
        currentBaseCurrency = baseCurrency;
        lastUpdate = new Date(data.time_last_update_utc);
        
        updateUI();
        
    } catch (error) {
        console.error('Erro ao carregar taxas de câmbio:', error);
        showError('Não foi possível carregar as taxas. Tente novamente.');
    } finally {
        showLoader(false);
    }
}

function handleCurrencyChange() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    if (fromCurrency !== currentBaseCurrency) {
        loadExchangeRates(fromCurrency);
    } else if (document.getElementById('amount').value.trim()) {
        convertCurrency();
    }
}

function convertCurrency() {
    try {
        const amountInput = document.getElementById('amount').value.trim();
        const amount = parseFloat(amountInput);
        
        if (!amountInput || isNaN(amount) || amount <= 0) {
            throw new Error('Por favor, insira um valor válido maior que zero');
        }
        
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        
        if (fromCurrency === toCurrency) {
            document.getElementById('resultValue').textContent = amount.toFixed(2);
            document.getElementById('rateInfo').textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
            return;
        }
        
        
        if (!exchangeRates[toCurrency]) {
            throw new Error('Taxas de câmbio não disponíveis para a moeda de destino');
        }
        
        
        let rate;
        if (currentBaseCurrency === fromCurrency) {
            rate = exchangeRates[toCurrency];
        } else if (currentBaseCurrency === toCurrency) {
            rate = 1 / exchangeRates[fromCurrency];
        } else {
            rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        }
        
        const convertedAmount = amount * rate;
        
       
        document.getElementById('resultValue').textContent = convertedAmount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        document.getElementById('rateInfo').textContent = `1 ${fromCurrency} = ${rate.toLocaleString('pt-BR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        })} ${toCurrency}`;
        
    } catch (error) {
        showError(error.message);
    }
}

function swapCurrencies() {
    
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    
    
    const newFromSelect = fromSelect.cloneNode(true);
    const newToSelect = toSelect.cloneNode(true);
    
    
    newFromSelect.value = toValue;
    newToSelect.value = fromValue;
    
    
    fromSelect.parentNode.replaceChild(newFromSelect, fromSelect);
    toSelect.parentNode.replaceChild(newToSelect, toSelect);
    
    
    newFromSelect.addEventListener('change', handleCurrencyChange);
    newToSelect.addEventListener('change', function() {
        if (document.getElementById('amount').value.trim()) {
            convertCurrency();
        }
    });
    
    
    if (newFromSelect.value !== currentBaseCurrency) {
        loadExchangeRates(newFromSelect.value);
    } else if (document.getElementById('amount').value.trim()) {
        convertCurrency();
    }
    
    return false; 
}

function updateUI() {
    
    if (lastUpdate) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        document.getElementById('updateTime').innerHTML = 
            `<i class="fas fa-sync-alt"></i> Última atualização: ${lastUpdate.toLocaleDateString('pt-BR', options)}`;
    }
}

function showLoader(show) {
    const btn = document.querySelector('.convert-btn');
    if (show) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convertendo...';
        btn.disabled = true;
    } else {
        btn.innerHTML = 'Converter';
        btn.disabled = false;
    }
}

function showError(message) {
    alert(message);
    console.error(message);
}