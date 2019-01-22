# Persistent Guest Demo

Viewwers of a Live TV event can join a group chat and group video call.

## Steps to run the demo

1. Clone this repository & install all the dependencies

    ```sh
    git clone https://github.com/dciobanu/cl-guest-demo.git
    cd cl-guest-demo
    npm install
    ```

2. Use Webex Developer portal to register a JWT Issuer

    Open: https://developer.webex.com/my-apps/new/guest-issuer (you may be asked to login. Use your corporate credentials)
    
    Give it a name and click "Add Guest Issuer". Store the **Issuer ID** and **Issuer Shared Secret** in a safe place.

    **Warning-1:** You must be a paying Webex Teams customer
    
    **Warning-2:** The number of Guest Issuers that a developer can create is capped at maximum of 5

3. Open a terminal and run the following commands:

    ```sh
    export JWT_ISS=<Guest Issuer ID you just registered>
    export JWT_KEY=<Guest Issuer Secret you just registered>
    npm start
    ```

    If everything has been done correctly, this application should be in running state:
    ```sh
    > guest-demo@0.0.0 start Z:\Proiecte\Curente\Cisco\cisco-live\cl-guest-demo
    > node server.js                                                           
                                                                           
    Open http://localhost:4000 in Chrome                                       
    ```

4. Open a browser window to the [address indicated](http://localhost:4000) in previous step

    Note that Chrome is the recommended browser for this demo.

