# Courier

**Courier** is an interface to facilitate ad hoc parcel delivery.

## Workflow

The Couriers do not know what they are transporting. The Sender and Recipient communicate with each other the specifics of the exchange. The Sender seals the items to be sent with tamper evident seals and marks it with a QR code.

The Sender and the Recipient both specify position as a distance in time from a waypoint. Couriers bid on the expected travel time between the waypoints and the additional time to the client.

If a Sender or Recipient is uncomfortable with the Courier's discretion, they can enlist a more trusted Courier to route between themselves and the meeting with the Courier.

The workflow relies heavily on 3Box's confidental stores which allow restricting read and write access to a limited set of Ethereum identifiers.

The Sender and the Recipient are the sole users of a Deals/Seeking database which records Offers the Sender makes and requests the Recipient has.

When the Sender makes an offer, the Recipient may counter with a variation in quantity, price, or both.

When agreement is reached, the Recipient puts the deal amount in escrow. The Sender and Recipient both enter waypoints and the estimated time it will take to get from that point to themselves.

In a public Courier model, there are a set of databases corresponding to different positions in a [tesselation of the service area](https://github.com/mocnik-science/geogrid). Couriers subscribe to those data sources near themselves and listen for potential jobs.

In a trusted Courier model, Senders, Recipients, and Couriers create a social network to populate address books. Potential contracts are created collaboratively by Senders and Receivers then a version encrypted using the Courier's public key is sent to their inbox.

A Contract is floated describing the movement and sent to the tesselation for the pickup. Couriers bid on jobs until one is accepted by the Sender and Recipient both.

The Recipient then puts in escrow the amount for delivery.

The Courier then gets a chat session with the Sender. They coordinate on where the parcel is to be picked up.

As the Courier is driving their phone is working as a livestreaming dash cam. If they are stopped for any reason they can escalate their situation to get realtime legal advice as they encounter the police. 

When the parcel is picked up, it is marked with a GUID in the form of a QR code.

The Courier then finds the Recipient and delivers the parcel.

The inventory of the parcel associated with the GUID as well as information to open it such as combinations for locks is communicated via the Deals/Seeking database.

The Recipient inventories the parcel and reviews the Courier, the parcel contents, and the Sender.

## Faults

* A waypoint could be placed in an inaccessible location. The refutation process requires being at the specific location of the waypoint. This would need to be handled by checking the waypoints when placing the bid to verify it is possible to get with half a kilometer or so from them.
* The Sender might not respond to requests for a location. The Courier in this case goes to the waypoint and registers a Wait of, say, five minutes. If the Sender doesn't communicate in that time period, the Recipients escrow is returned minus a Wait fee.
* The Recipient doesn't respond to requests for a location. The same as with the Sender, in registering a Wait, but the Courier now has a parcel to deal with. It would have to go back to the Sender eventually. Ideally the Courier would hold it for a while and whenever the Recipient comes back online they organize reciept potentially with an additional contract for the Courier to make it back to the waypoint.
* The Recipient doesn't get what was agreed upon. The deal that generated the parcel provides specifics on what it should contain. The Recipient is able to review each item and explain how it differed from what was advertized.
* The Courier keeps a parcel. Couriers carry a bond and the amount to be staked is specified in the contract. If they accept the parcel, at a minimum they must check in at the receiver's waypoint or their stake is forfeit.
* The Courier opens the parcel. The parcels are meant to be tamper evident at the least. Pictures are taken by the Sender of how the external package should look and sent to the Recipient. If the Courier manages to circumvert the tamper hampering, there is little that can be done other than when the Recipient receives the parcel they record their belief it was adulterated.

## Testing

Initially I would like to move small trivial items like candy or coins.

I like the idea of parcels being combined into bundles and move as a group. I also like the idea of parcels starting to move before they are sold. They are purchased from the current holder who, like the Couriers, doesn't know what is inside.

## Currency

For all transactions I want to use the DAI stablecoin so prices are in, essentially, dollars rather than the wildly variable ETH.