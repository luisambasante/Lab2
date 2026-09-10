// API GraphQL para gestión de productos


const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");


// 1. DATOS: array en memoria con los productos iniciales

let productos = [
  {
    id: 1,
    nombre: "Laptop Dell",
    descripcion: "Laptop de 15 pulgadas con procesador Intel i7",
    precio: 899.99,
    cantidad: 5,
    categoria: "Electrónica",
  },
  {
    id: 2,
    nombre: "Mouse Logitech",
    descripcion: "Mouse inalámbrico USB",
    precio: 29.99,
    cantidad: 50,
    categoria: "Accesorios",
  },
  {
    id: 3,
    nombre: "Teclado Mecánico",
    descripcion: "Teclado gaming RGB mecánico",
    precio: 149.99,
    cantidad: 15,
    categoria: "Accesorios",
  },
  {
    id: 4,
    nombre: "Monitor Samsung",
    descripcion: "Monitor 27 pulgadas 144Hz",
    precio: 299.99,
    cantidad: 8,
    categoria: "Electrónica",
  },
];


// 2. SCHEMA: definición de tipos, queries y mutations

const schema = buildSchema(`
  type Producto {
    id: Int!
    nombre: String!
    descripcion: String!
    precio: Float!
    cantidad: Int!
    categoria: String!
  }

  input ProductoInput {
    nombre: String!
    descripcion: String!
    precio: Float!
    cantidad: Int!
    categoria: String!
  }

  type Query {
    productos: [Producto!]!
    producto(id: Int!): Producto
    filtrarProductos(nombre: String, categoria: String, precioMaximo: Float): [Producto!]!
  }

  type Mutation {
    crearProducto(datos: ProductoInput!): Producto!
    actualizarProducto(id: Int!, datos: ProductoInput!): Producto
    eliminarProducto(id: Int!): Producto
  }
`);


// 3. RESOLVERS: lógica de negocio para cada query/mutation

const root = {
  //QUERIES
  productos: () => {
    return productos;
  },

  producto: ({ id }) => {
    const encontrado = productos.find((p) => p.id === id);
    return encontrado || null;
  },

  filtrarProductos: ({ nombre, categoria, precioMaximo }) => {
    return productos.filter((p) => {
      const cumpleNombre = nombre
        ? p.nombre.toLowerCase().includes(nombre.toLowerCase())
        : true;
      const cumpleCategoria = categoria
        ? p.categoria.toLowerCase() === categoria.toLowerCase()
        : true;
      const cumplePrecio =
        precioMaximo !== undefined && precioMaximo !== null
          ? p.precio <= precioMaximo
          : true;

      return cumpleNombre && cumpleCategoria && cumplePrecio;
    });
  },

  //  MUTATIONS 
  crearProducto: ({ datos }) => {
    if (datos.precio < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    if (datos.cantidad < 0) {
      throw new Error("La cantidad no puede ser negativa");
    }

    const nuevoId =
      productos.length > 0
        ? Math.max(...productos.map((p) => p.id)) + 1
        : 1;

    const nuevoProducto = { id: nuevoId, ...datos };
    productos.push(nuevoProducto);

    return nuevoProducto;
  },

  actualizarProducto: ({ id, datos }) => {
    const posicion = productos.findIndex((p) => p.id === id);
    if (posicion === -1) {
      return null;
    }

    if (datos.precio < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    if (datos.cantidad < 0) {
      throw new Error("La cantidad no puede ser negativa");
    }

    const productoActualizado = { id, ...datos };
    productos[posicion] = productoActualizado;

    return productoActualizado;
  },

  eliminarProducto: ({ id }) => {
    const posicion = productos.findIndex((p) => p.id === id);
    if (posicion === -1) {
      return null;
    }

    const [productoEliminado] = productos.splice(posicion, 1);
    return productoEliminado;
  },
};


// 4. SERVIDOR: configuración de Express + GraphQL

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(` Servidor disponible en http://localhost:${PORT}/graphql`);
  console.log("GraphiQL en el navegado ");
});
