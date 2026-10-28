# Kevin's Cookie Shop Tycoon

Open **index.html** in any modern web browser. No installation, server, or build step is required. All game files are local; optional Google Fonts fall back to system fonts offline.

Start with $100 and run your shop for 30 days. Choose a cookie recipe, batch size, cookie price, and advertising budget, then select **Bake & open shop** to finish a day. Daily shop costs are $5. You must afford the entire day's investment before opening. Unsold cookies are discarded.

Choose classic chocolate chip ($0.50 ingredients), double chocolate ($0.75), oatmeal & honey ($0.40), or red velvet ($1.00). Each recipe has its own demand and suggested selling price. Changing recipes sets the suggested price, which you can adjust. The ledger records the recipe and actual costs for each day.

Bruno, the shop's intimidating bouncer, appears on the page and guards the counter during the animated customer scene. He is a visual character and adds no expenses. Existing main-game saves are preserved; older sales are recorded as classic chocolate chip.

Demand responds to price, advertising (with diminishing returns), the day's conditions, your growing presence, and a little randomness. The goal is to finish with as much cash as possible. If cash falls below $5, the shop closes early.

Progress is saved automatically in this browser when local storage is available. **Start fresh** resets the game.

When you open the shop, a cartoon crowd visits the counter: one customer buys each sold cookie. The show lasts roughly one second per 10 customers (at least one second), with a live customer and revenue count. Choose **Skip to results** or press Escape to finish immediately. Reduced-motion preferences replace the moving crowd with a quiet shop scene and live totals.

Run integration checks with `node verify.cjs`.
