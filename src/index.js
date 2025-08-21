import './index.scss';
import { useEffect, useState } from '@wordpress/element';
import { SelectControl, Spinner } from '@wordpress/components';
import { registerBlockType } from "@wordpress/blocks";

const CryptoPriceTracker = ({ attributes, setAttributes }) => {
    const { symbol = 'BTCUSDT' } = attributes;
    const [price, setPrice] = useState('Loading...');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                const res = await fetch("/wp-json/crypto/v1/symbols");
                const data = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error("Response not an array");
                }

                const usdtPairs = data.filter(s => s.symbol.endsWith("USDT"));

                const formatted = usdtPairs.map(s => ({
                    label: s.symbol.replace("USDT", ""),
                    value: s.symbol
                }));

                setOptions(formatted);
            } catch (err) {
                console.error("Error fetching symbol list", err);
            } finally {
                setLoading(false); 
            }
        };

        fetchSymbols();
    }, []);
    
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch(`/wp-json/crypto/v1/price?symbol=${symbol}`);
                const data = await res.json();
                setPrice(data.price || 'N/A');
            } catch {
                setPrice('Error fetching price');
            }
        };

        fetchPrice();
    }, [symbol]);


    return (
        <div className="cryptoPriceTracker">
            {loading ? (
                <Spinner />
            ) : (
                <SelectControl
                    label="Select Cryptocurrency"
                    value={symbol}
                    options={options}
                    onChange={(newSymbol) => setAttributes({ symbol: newSymbol })}
                    className="cryptoPriceTracker-select"
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            )}
            <div className="cryptoPriceTracker-price">
                <strong>{symbol.replace('USDT', '')} Price:</strong> ${price}
            </div>
        </div>
    );
};



registerBlockType('aleksei/crypto-price', {
    attributes: {
        symbol: {
            type: 'string',
            default: 'BTCUSDT'
        }
    },
    edit: (props) => <CryptoPriceTracker {...props} />,
    save: ({ attributes }) => {
        return (
            <div className="wp-block-aleksei-crypto-price" data-symbol={attributes.symbol}>
                <span class="crypto-loading">Loading price...</span>
            </div>
        );
    },
});


export default CryptoPriceTracker;
