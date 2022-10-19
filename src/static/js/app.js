function App() {
    const { Container, Row, Col } = ReactBootstrap;

    const [imgBase64, setImageBase64] = React.useState(null);
    const [imgUrl, setImageUrl] = React.useState(null);
    const [imgFile, setImageFile] = React.useState(null);

    React.useEffect(() => {
        let start = performance.now();
        let end = null;
        let report = 'Performance report:</br>'
        fetch('/images/json-base64')
            .then(r => r.json())
            .then(setImageBase64)
            .then(() => {
                end = performance.now();
                let perfStat = `Static image&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-> ~150 ms</br>`;
                perfStat += `JSON base64&nbsp;&nbsp;-> ${formatTime(end - start)} ms</br>`;
                report += perfStat;
                start = performance.now();
                return fetch('/images/json-url');
            })

            .then(r => r.json())
            .then(setImageUrl)
            .then(() => {
                end = performance.now();
                const perfStat = `JSON URL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-> ${formatTime(end - start)} (+ ~50) ms</br>`;
                report += perfStat;
                start = performance.now();
                return fetch('/images/file');
            })

            .then(r => r.blob())
            .then(blob => {
                setImageFile(URL.createObjectURL(blob));
            })
            .then(() => {
                end = performance.now();
                const perfStat = `RAW IMAGE&nbsp;&nbsp;&nbsp;-> ${formatTime(end - start)} (+ ~10) ms`;
                report += perfStat;
                const p = document.getElementById('perf-report')
                p.innerHTML = report;
            });

    }, []);
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoListCard />
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>Static image</p>
                    <img src={'/public/bavarian-style-village.jpeg'} width={300} alt={'bavarian-style-village'}/>
                </Col>
                <Col>
                    <p>JSON base64</p>
                    {imgBase64 && <img src={`data:image/jpeg;base64,${imgBase64.img}`} width={300} alt={'france-style-village'}/>}
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>JSON URL</p>
                    {imgUrl && <img src={imgUrl.img} width={300} alt={'germany-style-village'}/>}
                </Col>
                <Col>
                    <p>Raw image</p>
                    {imgFile && <img src={imgFile} width={300} alt={'coburg-style-village'}/>}
                </Col>
            </Row>
            <Row>
                <Col>
                    <p id = 'perf-report'>HI</p>
                </Col>
            </Row>
        </Container>
    );
}

function formatTime(num) {
    return num.toFixed(2);
}

function TodoListCard() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items],
    );

    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">You have no todo items yet! Add one above!</p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
