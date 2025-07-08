// Region-based pricing system
class PricingManager {
    constructor() {
        this.currentRegion = this.getStoredRegion();
        this.nightCharge = 1500;
        this.init();
    }
    
    init() {
        this.setupRegionToggle();
        this.updateAllPrices();
        this.setupNightTimeToggle();
    }
    
    getStoredRegion() {
        return localStorage.getItem('selectedRegion') || 'other';
    }
    
    setRegion(region) {
        this.currentRegion = region;
        localStorage.setItem('selectedRegion', region);
        this.updateAllPrices();
        this.updateRegionDisplay();
    }
    
    setupRegionToggle() {
        // Create region toggle if it doesn't exist
        const existingToggle = document.getElementById('regionToggle');
        if (!existingToggle) {
            this.createRegionToggle();
        }
        
        // Set initial state
        this.updateRegionDisplay();
        
        // Add event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.region-btn')) {
                const region = e.target.dataset.region;
                this.setRegion(region);
            }
        });
    }
    
    createRegionToggle() {
        const heroSection = document.querySelector('.hero-section .container .row');
        if (heroSection) {
            const toggleHTML = `
                <div class="col-12 mt-4">
                    <div class="region-toggle-container" id="regionToggle">
                        <div class="region-toggle">
                            <span class="toggle-label">Select Your Region:</span>
                            <div class="toggle-buttons">
                                <button class="region-btn" data-region="ncr">
                                    <i class="bi bi-building me-2"></i>Delhi-NCR
                                </button>
                                <button class="region-btn" data-region="other">
                                    <i class="bi bi-geo-alt me-2"></i>Rest of India
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            heroSection.insertAdjacentHTML('beforeend', toggleHTML);
        }
    }
    
    updateRegionDisplay() {
        const buttons = document.querySelectorAll('.region-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.region === this.currentRegion);
        });
        
        // Update region indicator in navbar if exists
        const regionIndicator = document.getElementById('regionIndicator');
        if (regionIndicator) {
            const regionName = this.currentRegion === 'ncr' ? 'Delhi-NCR' : 'Rest of India';
            regionIndicator.textContent = regionName;
        }
    }
    
    updateAllPrices() {
        // Update therapist cards
        document.querySelectorAll('[data-therapist-id]').forEach(card => {
            this.updateTherapistPrice(card);
        });
        
        // Update booking modal if open
        this.updateBookingModalPrice();
    }
    
    updateTherapistPrice(card) {
        const therapistId = card.dataset.therapistId;
        const priceNcr = parseFloat(card.dataset.priceNcr || 0);
        const priceOther = parseFloat(card.dataset.priceOther || 0);
        
        const currentPrice = this.currentRegion === 'ncr' ? priceNcr : priceOther;
        
        // Update price display
        const priceElement = card.querySelector('.price-display');
        if (priceElement) {
            priceElement.textContent = `₹${currentPrice.toLocaleString('en-IN')}/session`;
        }
    }
    
    setupNightTimeToggle() {
        document.addEventListener('change', (e) => {
            if (e.target.matches('#nightTimeToggle')) {
                this.updateBookingModalPrice();
            }
        });
    }
    
    updateBookingModalPrice() {
        const modal = document.getElementById('bookingModal');
        if (!modal || !modal.classList.contains('show')) return;
        
        const therapistId = document.getElementById('bookingTherapistId')?.value;
        if (!therapistId) return;
        
        // Get therapist prices from data attributes
        const therapistCard = document.querySelector(`[data-therapist-id="${therapistId}"]`);
        if (!therapistCard) return;
        
        const priceNcr = parseFloat(therapistCard.dataset.priceNcr || 0);
        const priceOther = parseFloat(therapistCard.dataset.priceOther || 0);
        const basePrice = this.currentRegion === 'ncr' ? priceNcr : priceOther;
        
        // Check if night time is selected
        const isNight = document.getElementById('nightTimeToggle')?.checked || false;
        const nightCharge = isNight ? this.nightCharge : 0;
        const totalPrice = basePrice + nightCharge;
        
        // Update price displays
        this.updatePriceBreakdown(basePrice, nightCharge, totalPrice);
        
        // Update hidden form fields
        const bookingAmount = document.getElementById('bookingAmount');
        if (bookingAmount) {
            bookingAmount.value = totalPrice;
        }
    }
    
    updatePriceBreakdown(basePrice, nightCharge, totalPrice) {
        const breakdownContainer = document.getElementById('priceBreakdown');
        if (!breakdownContainer) return;
        
        const regionName = this.currentRegion === 'ncr' ? 'Delhi-NCR' : 'Rest of India';
        
        let breakdownHTML = `
            <div class="price-breakdown">
                <div class="d-flex justify-content-between">
                    <span>Base Price (${regionName}):</span>
                    <span>₹${basePrice.toLocaleString('en-IN')}</span>
                </div>
        `;
        
        if (nightCharge > 0) {
            breakdownHTML += `
                <div class="d-flex justify-content-between text-warning">
                    <span>Night Time Charge:</span>
                    <span>₹${nightCharge.toLocaleString('en-IN')}</span>
                </div>
            `;
        }
        
        breakdownHTML += `
                <hr class="my-2">
                <div class="d-flex justify-content-between fw-bold text-success">
                    <span>Total Amount:</span>
                    <span>₹${totalPrice.toLocaleString('en-IN')}</span>
                </div>
            </div>
        `;
        
        breakdownContainer.innerHTML = breakdownHTML;
        
        // Update main display amount
        const displayAmount = document.getElementById('displayAmount');
        if (displayAmount) {
            displayAmount.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
        }
    }
    
    getBookingData() {
        return {
            region: this.currentRegion,
            isNight: document.getElementById('nightTimeToggle')?.checked || false,
            nightCharge: document.getElementById('nightTimeToggle')?.checked ? this.nightCharge : 0
        };
    }
}

// Initialize pricing manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pricingManager = new PricingManager();
});

// Export for global access
window.PricingManager = PricingManager;