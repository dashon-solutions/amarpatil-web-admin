async function run() {
  try {
    const res = await fetch("https://amarpatil-web-admin.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "amarpatil@gmail.com",
        password: "Dashon@2025"
      })
    });
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error(err);
  }
}
run();
