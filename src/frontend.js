document.addEventListener("DOMContentLoaded", () => {
    const blocks = document.querySelectorAll(".wp-block-aleksei-crypto-price");

    blocks.forEach((block) => {
        const symbol = block.dataset.symbol || "BTCUSDT";

        const fetchPrice = async () => {
            try {
                const response = await fetch(`/wp-json/crypto/v1/price?symbol=${symbol}`);
                const data = await response.json();

                if (data.price) {
                    block.innerHTML = `<strong>${symbol.replace("USDT","")} Price:</strong> $${data.price}`;
                } else {
                    block.innerHTML = `<em>Price not available</em>`;
                }
            } catch {
                block.innerHTML = `<em>Error fetching price</em>`;
            }
        };

        fetchPrice();
        setInterval(fetchPrice, 1000);
    });
});
