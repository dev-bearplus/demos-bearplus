import gsap from 'gsap';
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';
import Splitting from 'splitting';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
class Line {
	// line position
    position = -1;
    // cells/chars
    cells = [];

	/**
	 * Constructor.
	 * @param {Element} DOM_el - the char element (<span>)
	 */
	constructor(linePosition) {
		this.position = linePosition;
	}
}

class Cell {
	// DOM elements
	DOM = {
		// the char element (<span>)
		el: null,
	};
    // cell position
    position = -1;
    // previous cell position
    previousCellPosition = -1;
    // original innerHTML
    original;
    // current state/innerHTML
    state;
    color;
    originalColor;
    // cached values
    cache;

	/**
	 * Constructor.
	 * @param {Element} DOM_el - the char element (<span>)
	 */
	constructor(DOM_el, {
        position,
        previousCellPosition
    } = {}) {
		this.DOM.el = DOM_el;
        this.original = this.DOM.el.innerHTML;
        this.state = this.original;
        this.color = this.originalColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
        this.position = position;
        this.previousCellPosition = previousCellPosition;
	}
    /**
     * @param {string} value
     */
    set(value) {
        this.state = value;
        this.DOM.el.innerHTML = this.state;
    }
}

export class TypeShuffle {
	// DOM elements
	DOM = {
		// the main text element
		el: null,
	};
    // array of Line objs
    lines = [];
    // array of letters and symbols
    lettersAndSymbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '!', '@', '#', '$', '&', '*', '(', ')', '-', '_', '+', '=', '/', '[', ']', '{', '}', ';', ':', '<', '>', ',', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // effects and respective methods
    effects = {
        'fx1': () => this.fx1(),
        'fx2': () => this.fx2(),
        'fx3': () => this.fx3(),
        'fx4': () => this.fx4(),
        'fx5': () => this.fx5(),
        'fx6': () => this.fx6(),
    };
    totalChars = 0;

	/**
	 * Constructor.
	 * @param {Element} DOM_el - main text element
	 */
	constructor(DOM_el) {
        this.DOM.el = DOM_el;
        // Apply Splitting (two times to have lines, words and chars)
        const results = Splitting({
            target: this.DOM.el,
            by: 'lines'
        })
        results.forEach(s => Splitting({ target: s.words }));

        // for every line
        for (const [linePosition, lineArr] of results[0].lines.entries()) {
            // create a new Line
            const line = new Line(linePosition);
            let cells = [];
            let charCount = 0;
            // for every word of each line
            for (const word of lineArr) {
                // for every character of each line
                for (const char of [...word.querySelectorAll('.char')]) {
                    cells.push(
                        new Cell(char, {
                            position: charCount,
                            previousCellPosition: charCount === 0 ? -1 : charCount-1
                        })
                    );
                    ++charCount;
                }
            }
            line.cells = cells;
            this.lines.push(line);
            this.totalChars += charCount;
        }

        // TODO
        // window.addEventListener('resize', () => this.resize());
	}
    /**
     * clear all the cells chars
     */
    clearCells() {
        for (const line of this.lines) {
            for (const cell of line.cells) {
                cell.set('&nbsp;');
            }
        }
    }
    /**
     *
     * @returns {string} a random char from this.lettersAndSymbols
     */
    getRandomChar() {
        return this.lettersAndSymbols[Math.floor(Math.random() * this.lettersAndSymbols.length)];
    }
    /**
     * Effect 1 - clear cells and animate each line cells (delays per line and per cell)
     */
    fx1() {
        // max iterations for each cell to change the current value
        const MAX_CELL_ITERATIONS = 45;

        let finished = 0;

        // clear all cells values
        this.clearCells();

        // cell's loop animation
        // each cell will change its value MAX_CELL_ITERATIONS times
        const loop = (line, cell, iteration = 0) => {
            // cache the previous value
            cell.cache = cell.state;

            // set back the original cell value if at the last iteration
            if ( iteration === MAX_CELL_ITERATIONS-1 ) {
                cell.set(cell.original);
                ++finished;
                if ( finished === this.totalChars ) {
                    this.isAnimating = false;
                }
            }
            // if the cell is the first one in its line then generate a random char
            else if ( cell.position === 0 ) {
                // show specific characters for the first 9 iterations (looks cooler)
                cell.set(iteration < 9 ?
                        ['*', '-', '\u0027', '\u0022'][Math.floor(Math.random() * 4)] :
                        this.getRandomChar());
            }
            // get the cached value of the previous cell.
            // This will result in the illusion that the chars are sliding from left to right
            else {
                cell.set(line.cells[cell.previousCellPosition].cache);
            }

            // doesn't count if it's an empty space
            if ( cell.cache != '&nbsp;' ) {
                ++iteration;
            }

            // repeat...
            if ( iteration < MAX_CELL_ITERATIONS ) {
                setTimeout(() => loop(line, cell, iteration), 15);
            }
        };

        // set delays for each cell animation
        for (const line of this.lines) {
            for (const cell of line.cells) {
                setTimeout(() => loop(line, cell), (line.position+1)*200);
            }
        }
    }
    fx2() {
        const MAX_CELL_ITERATIONS = 20;
        let finished = 0;
        const loop = (line, cell, iteration = 0) => {
            if ( iteration === MAX_CELL_ITERATIONS-1 ) {
                cell.set(cell.original);
                cell.DOM.el.style.opacity = 0;
                setTimeout(() => {
                    cell.DOM.el.style.opacity = 1;
                }, 300);

                ++finished;
                if ( finished === this.totalChars ) {
                    this.isAnimating = false;
                }
            }
            else {
                cell.set(this.getRandomChar());
            }

            ++iteration;
            if ( iteration < MAX_CELL_ITERATIONS ) {
                setTimeout(() => loop(line, cell, iteration), 40);
            }
        };

        for (const line of this.lines) {
            for (const cell of line.cells) {
                setTimeout(() => loop(line, cell), (cell.position+1)*30);
            }
        }
    }
    fx3() {
        const MAX_CELL_ITERATIONS = 10;
        let finished = 0;
        this.clearCells();

        const loop = (line, cell, iteration = 0) => {
            if ( iteration === MAX_CELL_ITERATIONS-1 ) {
                cell.set(cell.original);
                ++finished;
                if ( finished === this.totalChars ) {
                    this.isAnimating = false;
                }
            }
            else {
                cell.set(this.getRandomChar());
            }

            ++iteration;
            if ( iteration < MAX_CELL_ITERATIONS ) {
                setTimeout(() => loop(line, cell, iteration), 80);
            }
        };

        for (const line of this.lines) {
            for (const cell of line.cells) {
                setTimeout(() => loop(line, cell), randomNumber(0,2000));
            }
        }
    }
    fx4() {
        const MAX_CELL_ITERATIONS = 30;
        let finished = 0;
        this.clearCells();

        const loop = (line, cell, iteration = 0) => {
            cell.cache = cell.state;

            if ( iteration === MAX_CELL_ITERATIONS-1 ) {
                cell.set(cell.original);

                ++finished;
                if ( finished === this.totalChars ) {
                    this.isAnimating = false;
                }
            }
            else if ( cell.position === 0 ) {
                cell.set(['*',':'][Math.floor(Math.random() * 2)]);
            }
            else {
                cell.set(line.cells[cell.previousCellPosition].cache);
            }

            if ( cell.cache != '&nbsp;' ) {
                ++iteration;
            }

            if ( iteration < MAX_CELL_ITERATIONS ) {
                setTimeout(() => loop(line, cell, iteration), 15);
            }
        };

        for (const line of this.lines) {
            for (const cell of line.cells) {
                setTimeout(() => loop(line, cell), Math.abs(this.lines.length/2-line.position)*400);
            }
        }
    }
    fx5() {
        // max iterations for each cell to change the current value
        const MAX_CELL_ITERATIONS = 65;
        let finished = 0;
        this.clearCells();

        const loop = (line, cell, iteration = 0) => {
            cell.cache = {'state': cell.state, 'color': cell.color};

            if ( iteration === MAX_CELL_ITERATIONS-1 ) {
                cell.color = cell.originalColor;
                cell.DOM.el.style.color = cell.color;
                cell.set(cell.original);

                ++finished;
                if ( finished === this.totalChars ) {
                    this.isAnimating = false;
                }
                gsap.set(cell.DOM.el, { '--opa': 0 });
            }
            else if ( cell.position === 0 ) {
                cell.color = ['#343131', '#D8A25E', '#7A1CAC'][Math.floor(Math.random() * 3)]
                cell.DOM.el.style.color = cell.color
                cell.set(iteration < 9 ?
                        ['*', '-', '\u0027', '\u0022'][Math.floor(Math.random() * 4)] :
                    this.getRandomChar());
            }
            else {
                cell.set(line.cells[cell.previousCellPosition].cache.state);

                cell.color = line.cells[cell.previousCellPosition].cache.color
                cell.DOM.el.style.color = cell.color
            }

            if ( cell.cache.state != '&nbsp;' ) {
                ++iteration;
            }

            if ( iteration < MAX_CELL_ITERATIONS ) {
                setTimeout(() => loop(line, cell, iteration), 10);
            }
        };

        for (const line of this.lines) {
            for (const cell of line.cells) {
                setTimeout(() => loop(line, cell), (line.position+1)*200);
            }
        }
    }
    fx6() {
        // max iterations for each cell to change the current value
        const MAX_CELL_ITERATIONS = 15;
        let finished = 0;
        const loop = (line, cell, iteration = 0) => {
            cell.cache = {'state': cell.state, 'color': cell.color};

            if ( iteration === MAX_CELL_ITERATIONS-1 ) {
                cell.set(cell.original);

                cell.color = cell.originalColor;
                cell.DOM.el.style.color = cell.color;

                ++finished;
                if ( finished === this.totalChars ) {
                    this.isAnimating = false;
                }
            }
            else {
                cell.set(this.getRandomChar());

                cell.color = ['#393646', '#4F4557', '#6D5D6E', '#F4EEE0'][Math.floor(Math.random() * 4)]
                cell.DOM.el.style.color = cell.color
            }

            ++iteration;
            if ( iteration < MAX_CELL_ITERATIONS ) {
                setTimeout(() => loop(line, cell, iteration), randomNumber(30,110));
            }
        };

        for (const line of this.lines) {
            for (const cell of line.cells) {
                setTimeout(() => loop(line, cell), (line.position+1)*80);
            }
        }
    }
    /**
     * call the right effect method (defined in this.effects)
     * @param {string} effect - effect type
     */
    trigger(effect = 'fx1') {
        if ( !(effect in this.effects) || this.isAnimating ) return;
        this.isAnimating = true;
        this.effects[effect]();
    }
}

function selectDropdown() {
    // Initialize filters
    const filters = {
        _data: { hosting: 'all', cms: 'all', creative: 'all', categorize: 'all', publicity: 'all', platform: 'all' },
        get() { return this._data; },
        set(newData) { this._data = newData; },
        setKey(key, value) { this._data[key] = value; }
    };

    const resetButton = document.querySelector('.project-filter-reset');
    const selects = document.querySelectorAll('.select');
    const projectItems = document.querySelectorAll('.project-item');
    const searchInput = document.querySelector('.search-bar-input');

    // Handle select dropdown toggle
    selects.forEach(select => {
        select.addEventListener('click', function(e) {
            // Prevent event bubbling for select items
            if (e.target.closest('.select-item')) return;

            // Toggle active state
            this.classList.toggle('active');

            // Close other dropdowns
            selects.forEach(el => {
                if (el !== this) el.classList.remove('active');
            });
        });

        // Handle select item click
        const selectItems = select.querySelectorAll('.select-item');
        selectItems.forEach(item => {
            item.addEventListener('click', function() {
                // Update active state for items in this dropdown
                selectItems.forEach(element => element.classList.remove('active'));
                this.classList.add('active');

                // Update select value
                select.querySelector('.select-value').value = this.textContent;

                // Update filters
                const selectedCategory = select.dataset.name;
                const selectedValue = this.dataset.value;
                filters.setKey(selectedCategory, selectedValue);

                // Apply filters and animate items
                applyFilters();

                // Toggle reset button visibility
                toggleResetButton();
            });
        });
    });

    // Reset button handler
    resetButton.addEventListener('click', function() {
        // Reset filters
        filters.set({ hosting: 'all', cms: 'all', creative: 'all', categorize: 'all' });

        // Show all items with animation
        projectItems.forEach((item, index) => {
            item.style.display = '';
            gsap.fromTo(item,
                {y: 80, opacity: 0},
                {y: 0, opacity: 1, delay: index * 0.05, duration: 1.2, overwrite: true}
            );
        });

        // Hide reset button
        resetButton.classList.remove('active');
        // Reset search input
        if (searchInput) searchInput.value = '';

        // Reset active states in dropdowns
        selects.forEach(select => {
            const defaultItem = select.querySelector('.select-item[data-value="all"]');
            if (defaultItem) {
                select.querySelectorAll('.select-item').forEach(item => item.classList.remove('active'));
                defaultItem.classList.add('active');
                select.querySelector('.select-value').value = defaultItem.textContent;
            }
        });
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', function(e) {
        if (!e.target.closest('.select')) {
            selects.forEach(select => select.classList.remove('active'));
        }
    });

    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener("input", function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchValue = this.value.toLowerCase().trim();
                applyFilters(searchValue);
            }, 500);
        })
    }

    // Helper function to apply filters
    function applyFilters(searchValue = '') {
        let visibleCount = 0;

        projectItems.forEach(item => {
            let matchesFilter = true;
            
            // Check if item matches all active filters
            for (const [key, value] of Object.entries(filters.get())) {
                if (value !== 'all' && item.querySelector(`[data-${key}]`)?.dataset[key] !== value) {
                    matchesFilter = false;
                    break;
                }
            }

            let matchesSearch = true;
            if (searchValue !== '') {
                matchesSearch = item.querySelector('.card-body-title').textContent.toLowerCase().includes(searchValue);
            }

            // Show/hide item based on filter match
            const shouldDisplay = matchesFilter && matchesSearch;
            item.style.display = shouldDisplay ? '' : 'none';

            // Animate visible items

            if (shouldDisplay) {
                gsap.fromTo(item,
                    {y: 80, opacity: 0},
                    {y: 0, opacity: 1, delay: visibleCount * 0.05, duration: 1.2, overwrite: true}
                );
                visibleCount++;
            }
        });
    }

    // Helper function to toggle reset button
    function toggleResetButton() {
        const hasActiveFilters = Object.values(filters.get()).some(value => value !== 'all');
        resetButton.classList[hasActiveFilters ? 'add' : 'remove']('active');
    }
}
const init = () => {
    gsap.registerPlugin(ScrollTrigger);

    window.scrollTo(0, 0);
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    gsap.set('.project-filter', { opacity: 1 });
    gsap.to('.project-head', { opacity: 1, delay: 1, duration: .5 });
    gsap.from('.project-logo', { scale: 1.2, delay: 1.65, opacity: 0, duration: 1, ease: 'back.out(1.3)', filter: 'blur(15px)' });
    gsap.to('.project-listing', { opacity: 1, duration: 1, delay: .6 });
    gsap.from('.search-bar, .select', { y: 20, duration: 1, opacity: 0, ease:'back.out(1.3)', filter: 'blur(15px)', delay: 1.5, stagger: .05 })

    gsap.set('.project-item', { y: 80, opacity: 0 });
    setTimeout(() => {
        ScrollTrigger.batch('.project-item', {
            start: `top bottom`,
            batchMax: 4,
            once: true,
            onEnter: batch => gsap.to(batch, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 1.2, overwrite: true })
        })
    }, 1500);
    setTimeout(() => {
        new TypeShuffle(document.querySelector('.project-title')).trigger('fx2');
        new TypeShuffle(document.querySelector('.project-sub')).trigger('fx6');
    }, 500);
    selectDropdown();
};
init();
