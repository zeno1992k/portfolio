//isotope 페이지 로드 이벤트
window.addEventListener("load", () => {
  const grid = new Isotope("section", {
    itemSelector: "article",
    columnWidth: "article",
    transitionDuration: "0.5s"
  });

  const btns = document.querySelectorAll("main ul li");
  for (let el of btns) {
    el.addEventListener("click", e => {
      e.preventDefault();

      const sort = e.currentTarget.querySelector("a").getAttribute("href");

      grid.arrange({
        filter: sort
      });

      for (let el of btns) {
        el.classList.remove("on");
      }

      e.currentTarget.classList.add("on");
    });
  }

});
 
/* 함수로 정의하기 */
/* 
const frame = "section";
const box = "article";
const speed = "0.5s";
const activeClass = "on";
const btn = document.querySelectorAll("main ul li");
let grid;

window.addEventListener("load",()=>{
  init();
  filter(btn);
});

function init(){
  grid = new Isotope(frame,{
  itemSelector:box,
  columnWidth:box,
  transitionDuration:speed
  });
}

function filter(arr){
  for(let el of arr){
  
    el.addEventListener("click",e=>{
      e.preventDefault();

      const sort = e.currentTarget.querySelector("a").getAttribute("href");

      grid.arrange({
      filter:sort
      });

      for(let el of arr){
        el.classList.remove(activeClass);
      }
      e.currentTarget.classList.add(activeClass);
    })
  }
}



*/