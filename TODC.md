1. useLayoutEffect: read or correct layout before paint
   At layout-Effect time, React has committed the DOM and assigned refs, but the browser has not painted the result. This lets code measure a node and synchronously render a corrected position without showing the wrong position first.

```
const boxRef = useRef(null);
const [height, setHeight] = useState(0);

useLayoutEffect(() => {
const rect = boxRef.current.getBoundingClientRect();
setHeight(rect.height);
}, []);
```

This can produce: render with height 0 → commit → measure → synchronous render with real height → commit → paint. The user sees only the corrected frame.

### что значит synchronous render with real height

The cost is direct: layout work and state updates here block paint. Prefer useEffect unless showing the intermediate frame would be wrong.

---

2. useEffectEvent

3. useInsertionEffect

4. useSyncExternalStore(() => {})

---
### KEY и идентификация

как может получиться что при изменении isTaylor мы не увидим стейт из нового Counter?

```tsx
{isTaylor
  ? <Counter person="Taylor" />
  : <Counter person="Sarah" />}
```

Можно ли иметь одинаковый key в разных ветках DOM? А в одной ветке?

Перформанс в браузере 
— что будет если обновить стейт вверху дерева (App)
- если поменять key у App
- рендеры это плохо?

```tsx
interface Courier {
   name: string,
   type: 'bike', 'foot',
   cargo: Cargo[],
   location: {lat: number, lon: number},
   speed: number
}

function CourierCard({
   name,
   type,
   cargo,
   location,
   speed,
}: Courier) {
   return
}
```


###Cache

складывать в переменную в рантайме и хранить там — мемори кещ
указать в кеш контроле ттл или не храни
спец механизм e-tag — бэкенд кеширует и может ответить фронтенду используй что у тебя есть

если у браузера есть кэш он не шлет запрос

отдача из кэша дешевле по CPU

Redis — ключ-значение БД, может работать по типу как кэш. Ключом может быть url с квери параметрами. Крон задача на сервере по расписанию для обновления редиса чтобы кэш не протухал. ограничен размер.

NGINX - тупой маршрутизатор. Может добавить заголовки до бэкенда.



