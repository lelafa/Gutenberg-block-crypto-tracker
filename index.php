<?php
/*
 * Plugin Name: Crypto Tracker Block
 * Plugin URI:  https://github.com/lelafa/Gutenberg-block-crypto-tracker
 * Description: A Gutenberg block that fetches and displays real-time cryptocurrency data from Binance.
 * Version:     1.0.0
 * Author:      Aleksei Anikeev
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: crypto-tracker
*/

if ( ! defined( 'ABSPATH' ) ) exit;


class Crypto_Tracker {

    public function __construct() {
        add_action( 'init', [ $this, 'register_block' ] );
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_block() {
        register_block_type( __DIR__ . '/build' );
    }

    public function register_routes() {
        register_rest_route( 'crypto/v1', '/symbols', [
            'methods'  => 'GET',
            'callback' => function () {
                $api_url = "https://api.binance.com/api/v3/ticker/price";
                $response = wp_remote_get( $api_url );

                if ( is_wp_error( $response ) ) {
                    return new WP_REST_Response( [ 'error' => 'Error fetching symbols' ], 500 );
                }

                $data = json_decode( wp_remote_retrieve_body( $response ), true );

                return is_array( $data )
                    ? new WP_REST_Response( $data, 200 )
                    : new WP_REST_Response( [ 'error' => 'Invalid response' ], 500 );
            },
        ] );
        
        register_rest_route('crypto/v1', '/price', [
            'methods' => 'GET',
            'callback' => function (WP_REST_Request $request) {
                $symbol = sanitize_text_field($request->get_param('symbol'));
                
                if (!$symbol) {
                    return new WP_Error('no_symbol', 'Symbol parameter required', ['status' => 400]);
                }

                $url = "https://api.binance.com/api/v3/ticker/price?symbol={$symbol}";
                $response = wp_remote_get($url);
                
                if (is_wp_error($response)) {
                    return new WP_Error('api_error', 'Error fetching price', ['status' => 500]);
                }

                $body = json_decode(wp_remote_retrieve_body($response), true);
                $formatted = number_format((float) $body['price'], 2, '.', '');

                return [
                    'symbol' => $symbol,
                    'price'  => $formatted
                ];
            },
        ]);
    }
}

new Crypto_Tracker();