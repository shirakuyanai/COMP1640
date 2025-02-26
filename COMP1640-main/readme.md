# **COMP1640 - TCH2601 - Nguyễn Group**

## **1. Server**

- Go to the *server* folder.

- Duplicate *.env.example* and rename it to something like *.env.local*.
> Note:
> - Do NOT delete *.env.example* or put your values in it.
> - The ones already filled out are the default values which are highly recommended to be left alone, unless you know what you are doing.
> - For *GMAIL_USER* and *GMAIL_PASS*, follow [this instruction](https://support.google.com/accounts/answer/185833?hl=en) to create an app password for your **Google account**.

- Fill out the environment variables with your own values.

- Install the dependencies by running:
```bash
npm install
```

- Create a migration for the **PostgreSQL** database:
```bash
npm run generate
```

- Run the migration:
```bash
npm run migrate
```

- After mgirating, import the data files in *demo_data* to their respective tables.

- Run the server by running:
```bash
npm run dev
```

- If you see this in the console, everything is working correctly:
```bash
Connected to PostgreSQL
listening on port 5000
```

## **2. Web Client**
- Go to the *web* folder.

- Do everything like the server to setup the environment variables.
> Note: copy *API_KEY* from server's environment and paste it in *VITE_APIKEY*.

- Install the dependencies by running:
```bash
npm install
```

- Run the web client by running:
```bash
npm run dev
```

- Go to `http://localhost:3000` in your browser. If you see `Congratulations, your server is up and running!` and `Hello, world!`, everything is working correctly.