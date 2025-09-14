// script.js
// No longer importing email.js as EmailJS library will be used directly
// import { sendBookingEmail } from './email.js';

// ---- DATA ----
const services = [
  {id:1,name:'Dry Cleaning',price:200,img:'https://cdn-icons-png.flaticon.com/512/3209/3209156.png'},
  {id:2,name:'Wash & Fold',price:300,img:'https://cdn-icons-png.flaticon.com/512/2974/2974990.png'},
  {id:3,name:'Ironing',price:150,img:'https://cdn-icons-png.flaticon.com/512/1047/1047717.png'},
  {id:4,name:'Stain Removal',price:250,img:'https://cdn-icons-png.flaticon.com/512/4903/4903428.png'},
  {id:5,name:'Leather & Suede Cleaning',price:899,img:'https://cdn-icons-png.flaticon.com/512/1188/1188631.png'},
  {id:6,name:'Wedding Dress Cleaning',price:2500,img:'https://cdn-icons-png.flaticon.com/512/2488/2488630.png'}
];

const cart = new Map();

// DOM refs
const servicesList = document.getElementById('servicesList');
const cartItems = document.getElementById('cartItems');
const totalAmount = document.getElementById('totalAmount');
const bookBtn = document.getElementById('bookNow');
const fullName = document.getElementById('fullName');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const scrollServices = document.getElementById('scrollServices');

const orderForm = document.getElementById('orderForm');
const orderIdField = document.getElementById('order_id');
const servicesField = document.getElementById('servicesHidden');
const totalField = document.getElementById('totalHidden');

// Initialize EmailJS with your public key
emailjs.init('VtnbmacxYV16avRMy');

// EmailJS send function
async function sendBookingEmail(formElement){
  try{
    await emailjs.sendForm('service_2brak9k', 'template_4jstrin', formElement);
    return true;
  }catch(err){
    throw new Error('EmailJS error: ' + err.text);
  }
}

// render functions
function renderServices(){
  servicesList.innerHTML='';
  services.forEach(s=>{
    const inCart=cart.has(s.id);
    const row=document.createElement('div');
    row.className='service'+(inCart?' selected':'');
    row.innerHTML=`
      <div class="service-left">
        <img class="service-icon" src="${s.img}" alt="${s.name}">
        <div class="service-name">${s.name}</div>
      </div>
      <div class="service-price">₹${s.price}</div>
      <button>${inCart?'Remove Item':'Add Item'}</button>
    `;
    row.querySelector('button').addEventListener('click',()=>{
      if(inCart) cart.delete(s.id); else cart.set(s.id,s);
      renderServices();renderCart();checkBookState();
    });
    servicesList.appendChild(row);
  });
}

function renderCart(){
  cartItems.innerHTML='';
  if(cart.size===0){
    cartItems.innerHTML='<div class="empty" style="color:var(--gray);font-size:14px">No items added yet.</div>';
    totalAmount.textContent='₹0';return;
  }
  let total=0;let idx=1;
  cart.forEach(s=>{
    total+=s.price;
    const line=document.createElement('div');
    line.className='cart-row';
    line.innerHTML=`<span>${idx++}. ${s.name}</span><span>₹${s.price}</span>`;
    cartItems.appendChild(line);
  });
  totalAmount.textContent='₹'+total;
}

function checkBookState(){
  const filled=fullName.value.trim()&&email.checkValidity()&&phone.value.trim().length>=7;
  bookBtn.disabled=!(cart.size>0 && filled);
}

[fullName,email,phone].forEach(el=>el.addEventListener('input',checkBookState));

function generateOrderId(){
  const t=Date.now();
  const r=Math.floor(Math.random()*9000)+1000;
  return `ORD-${t}-${r}`;
}
function buildCartSummary(){
  const items=Array.from(cart.values()).map((s,i)=>`${i+1}. ${s.name} (₹${s.price})`).join('\n');
  const total=Array.from(cart.values()).reduce((sum,s)=>sum+s.price,0);
  return {items,total};
}

// handle submit
orderForm.addEventListener('submit',async function(e){
  e.preventDefault();
  if(cart.size===0){alert('Please add at least one service before booking.');return;}

  const {items,total}=buildCartSummary();
  const orderId=generateOrderId();
  orderIdField.value=orderId;
  servicesField.value=items;
  totalField.value=`₹${total}`;

  const prevText=bookBtn.textContent;
  bookBtn.disabled=true;
  bookBtn.textContent='Sending...';

  try{
    await sendBookingEmail(orderForm);
    alert(`Booking confirmed — Order ID: ${orderId}\nA confirmation has been sent to ${email.value}.`);
    orderForm.reset();
    cart.clear();
    renderServices();
    renderCart();
    checkBookState();
  }catch(err){
    console.error(err);
    alert('Failed to send booking. Please try again.');
    bookBtn.disabled=false;
    bookBtn.textContent=prevText;
  }
});

// newsletter form
const newsletterForm=document.getElementById('newsletterForm');
if(newsletterForm){
  const subscribeBtn=newsletterForm.querySelector('button');
  newsletterForm.addEventListener('submit',e=>{
    e.preventDefault();
    subscribeBtn.textContent='Subscribed';
    subscribeBtn.disabled=true;
    subscribeBtn.style.opacity='0.7';
  });
}

// scroll button
scrollServices?.addEventListener('click',()=>{
  document.querySelector('#services').scrollIntoView({behavior:'smooth'});
});

renderServices();
renderCart();