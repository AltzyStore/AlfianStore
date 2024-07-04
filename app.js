const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("input", function () {
  let isValid = true;
  for (let i = 0; i < form.elements.length; i++) {
    const element = form.elements[i];
    if (
      (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT") &&
      element.type !== "hidden" &&
      element.value.trim() === ""
    ) {
      isValid = false;
      break;
    }
  }
  if (isValid) {
    checkoutButton.disabled = false;
    checkoutButton.classList.remove("disabled");
  } else {
    checkoutButton.disabled = true;
    checkoutButton.classList.add("disabled");
  }
});

// Function to handle queue
const handleQueue = () => {
  let queueNumber = localStorage.getItem("queueNumber") || 0;
  queueNumber++;
  localStorage.setItem("queueNumber", queueNumber);
  document.getElementById("queue").textContent = queueNumber;
  document.getElementById("checkoutForm").style.display = "none";
  document.getElementById("queueNumber").style.display = "block";
};

// Show/hide DANA barcode based on payment method selection
document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    if (event.target.value === "dana") {
      document.getElementById("danaBarcode").style.display = "block";
    } else {
      document.getElementById("danaBarcode").style.display = "none";
    }
  });
});

// Function to format the WhatsApp message
const formatMessage = (obj) => {
  let items;
  try {
    items = JSON.parse(obj.items);
    if (!Array.isArray(items)) {
      throw new Error("Items is not an array");
    }
  } catch (e) {
    console.error("Failed to parse items:", e);
    return "Invalid items data";
  }

  const formattedItems = items
    .map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)})`)
    .join("\n");

  const customerName = obj.name;
  const customerEmail = obj.email;
  const customerPhone = obj.phone;

  const total = rupiah(Number(obj.total));

  return `Data Customer
Nama: ${customerName}
Email: ${customerEmail}
No Hp: ${customerPhone}

Data Pesanan
${formattedItems}

TOTAL: ${total}
Terima Kasih.`;
};

// Function to format number to Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};

// Handle checkout button click
checkoutButton.addEventListener("click", function (e) {
  e.preventDefault();

  const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (selectedPaymentMethod === "whatsapp") {
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);

    // Mengambil data dari Alpine store
    const cart = Alpine.store("cart");
    const items = cart.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));
    objData.items = JSON.stringify(items);
    objData.total = cart.total;

    const message = formatMessage(objData);
    const whatsappUrl = `https://wa.me/6288291389753?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl);

    // Handle queue number display
    handleQueue();
  } else if (selectedPaymentMethod === "dana") {
    alert("Silakan scan kode QR DANA untuk melakukan pembayaran.");
    handleQueue();
  }
});

document.addEventListener("alpine:init", () => {
  Alpine.data("menu", () => ({
    items: [
      { id: 1, name: "Travel", img: "https://i.pinimg.com/474x/31/91/8d/31918d6e52cf33012f61c40132738084.jpg", price: 250000 },
      { id: 2, name: "Mabar Vip/Joki", img: "https://i.pinimg.com/564x/91/1f/47/911f47cf85cc668dbc659e62e8fce502.jpg", price: 50000},
      { id: 3, name: "Top up diamond", img: "https://i.pinimg.com/564x/48/49/78/4849789f019c1ffd27586c384a54cb31.jpg", price: 10000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      let existingItem = this.items.find((item) => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({ ...newItem, quantity: 1 });
      }
      this.updateCart();
    },
    increaseQuantity(index) {
      this.items[index].quantity++;
      this.updateCart();
    },
    decreaseQuantity(index) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity--;
      } else {
        this.items.splice(index, 1);
      }
      this.updateCart();
    },
    updateCart() {
      this.total = this.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      this.quantity = this.items.reduce(
        (quantity, item) => quantity + item.quantity,
        0
      );
      console.log(`Total Price: Rp ${this.total.toLocaleString("id-ID")}`);
      console.log(`Total Quantity: ${this.quantity}`);
    },
  });
});
