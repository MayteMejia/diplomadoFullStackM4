function validate(schema, target = 'body') {
    return (req, res, next) => {
        const data = req[target];

        //paso 1 verificar que existan datos
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).send({ message: 'No hay datos' });
        }

        //paso 2 validar contra el schema con opciones
        const { error, value } = schema.validate (data, {
            abortEarly: false, //No detenerse en el primer error, mostrar todos los errores
            stripUnknown: true, //Eliminar campos no definidos en el schema
        })

        //paso 3 si hay errores de validacion devolver 400 con mensaje claro
        if (error) {
            return res.status(400).json({ 
                message: `Error de validacion en ${target}`,
                errores: error.details.map(err => err.message)
            });
        }

        //paso 4 reemplazar el objeto original con datos limpios
        req[target] = value;

        //continuamos
        next();
    }
}

export default validate