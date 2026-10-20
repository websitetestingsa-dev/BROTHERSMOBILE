# Brothers Mobile — maps configuration

The Visit Us section embeds a Google Maps search for **Al Watan Center, Doha, Qatar**. Google controls the displayed result; verify the exact store listing before publishing. Google may require a Maps Embed API key for some embedding methods or regions.

Buttons open Google Maps, Apple Maps and Waze searches for the same location. These are place searches, NOT verified GPS coordinates for the shop entrance.

## Optional native Apple MapKit JS

The code supplied in chat cannot work without a valid Apple MapKit JS token, and its sample Cupertino coordinates point to California. To use MapKit JS instead of the Google Maps iframe:

1. Register for Apple Developer Maps and create a Maps identifier and MapKit JS token for your production domain.
2. Follow Apple's MapKit JS authentication guidance for your domain; do not commit private signing keys.
3. Obtain and verify the shop's exact coordinates from its actual map listing.
4. Replace the iframe with a MapKit container and initialize MapKit with those verified coordinates and a marker.

No MapKit token or shop GPS coordinate is fabricated in this package.

## Stock images

The default shelf now uses supplied showcase photos where available, but sample cards are not verified inventory. Use Manage Shop to replace samples with actual products, prices, quantities and images. Older browser drafts are retained; sample placeholders without images are updated automatically.
