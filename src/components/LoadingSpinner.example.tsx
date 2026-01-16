/**
 * LoadingSpinner Component Examples
 * 
 * Demonstrates different usage scenarios for the LoadingSpinner component
 */

import { LoadingSpinner } from './LoadingSpinner';

export function LoadingSpinnerExamples() {
    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <section>
                <h2>Small Spinner</h2>
                <LoadingSpinner size="small" message="Loading..." />
            </section>

            <section>
                <h2>Medium Spinner (Default)</h2>
                <LoadingSpinner message="Loading videos..." />
            </section>

            <section>
                <h2>Large Spinner</h2>
                <LoadingSpinner size="large" message="Saving your channels..." />
            </section>

            <section>
                <h2>Without Message</h2>
                <LoadingSpinner />
            </section>

            <section>
                <h2>Custom Messages</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <LoadingSpinner message="Searching for channels..." />
                    <LoadingSpinner message="Fetching videos..." />
                    <LoadingSpinner message="Processing..." />
                </div>
            </section>
        </div>
    );
}
