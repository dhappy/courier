# Courier

**Courier** is an interface to facilitate ad hoc parcel delivery.

## Workflow

The Couriers do not know what they are transporting. The Dealer and Customer communicate with each other the specifics of the exchange. The Dealer seals the items to be sent with tamper evident seals and marks it with a QR code.

The Dealer and the Customer both specify their distance in time from waypoints. Couriers bid on the expected travel time between the waypoints and the additional time to the client.

If a Dealer or Customer is uncomfortable with the Courier's discretion, they can enlist a more trusted Courier to route between themselves and the meeting with the Courier.

The workflow relies heavily on 3Box's confidental stores which allow restricting read and write access to a limited set of Ethereum identifiers.

The Dealer and the Customer are the sole users of a Deals/Seeking database which records Offers the Dealer makes and requests the Customer has.

When the Dealer makes an offer, the Customer may counter with a variation in quantity, price, or both.

When agreement is reached, the Customer puts the deal amount in escrow. The Dealer and Customer both enter waypoints and the estimated time it will take to get from that point to themselves.

There are a set of databases corresponding to different positions in a [tesselation of the globe](https://github.com/mocnik-science/geogrid). Couriers subscribe to those data sources near themselves and listen for potential jobs.

A Contract is floated describing the movement and sent to the tesselation for the pickup. Couriers bid on jobs until one is accepted by the Dealer and Customer both.

The Customer then puts in escrow the amount for delivery.

The Courier then gets a chat session with the Dealer. They coordinate on where the parcel is to be picked up.

As the Courier is driving their phone is working as a livestreaming dash cam. If they are stopped for any reason they can escalate their situation to get realtime legal advice as they encounter the police. 

When the parcel is picked up, it is marked with a GUID in the form of a QR code.

The Courier then finds the Customer and delivers the parcel.

The inventory of the parcel associated with the GUID as well as information to open it such as combinations for locks is communicated via the Deals/Seeking database.

The Customer inventories the parcel and reviews the Courier, the parcel contents, and the Dealer.

## Faults

* The Dealer might not respond to requests for a location. The Courier in this case goes to the waypoint and registers a Wait of, say, five minutes. If the Dealer doesn't communicate in that time period, the Customers escrow is returned minus a Wait fee.
* The Customer doesn't respond to requests for a location. The same as with the Dealer, in registering a Wait, but the Courier now has a parcel to deal with. It would have to go back to the Dealer eventually. Ideally the Courier would hold it for a while and whenever the Customer comes back online they organize reciept potentially with an additional contract for the Courier to make it back to the waypoint.
* The Customer doesn't get what was agreed upon. The deal that generated the parcel provides specifics on what it should contain. The Customer is able to review each item and explain how it differed from what was advertized.
* The Courier opens the parcel. The parcels are meant to be tamper evident at the least. Pictures are taken by the dealer of how the external package should look and sent to the Customer. If the Courier manages to circumvert the tamper hampering, there is little that can be done other than when the Customer receives the parcel they record their belief it was adulterated.

## Currency

For all transactions I want to use the DAI stablecoin so prices are in, essentially, dollars rather than the wildly variable ETH.