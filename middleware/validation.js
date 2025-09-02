// Validation middleware for customer and address data

const validateCustomer = (req, res, next) => {
    const { first_name, last_name, phone_number, email } = req.body;

    // Check required fields
    if (!first_name || !last_name || !phone_number) {
        return res.status(400).json({
            success: false,
            message: 'First name, last name, and phone number are required',
            missing_fields: {
                first_name: !first_name,
                last_name: !last_name,
                phone_number: !phone_number
            }
        });
    }

    // Validate first name
    if (typeof first_name !== 'string' || first_name.trim().length < 2 || first_name.trim().length > 50) {
        return res.status(400).json({
            success: false,
            message: 'First name must be between 2 and 50 characters'
        });
    }

    // Validate last name
    if (typeof last_name !== 'string' || last_name.trim().length < 2 || last_name.trim().length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Last name must be between 2 and 50 characters'
        });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone_number.toString().trim())) {
        return res.status(400).json({
            success: false,
            message: 'Phone number must be exactly 10 digits'
        });
    }

    // Validate email if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
    }

    // Sanitize inputs
    req.body.first_name = first_name.trim();
    req.body.last_name = last_name.trim();
    req.body.phone_number = phone_number.toString().trim();
    if (email) {
        req.body.email = email.trim().toLowerCase();
    }

    next();
};

const validateCustomerUpdate = (req, res, next) => {
    const { first_name, last_name, phone_number, email } = req.body;

    // For updates, at least one field should be provided
    if (!first_name && !last_name && !phone_number && !email) {
        return res.status(400).json({
            success: false,
            message: 'At least one field (first_name, last_name, phone_number, email) must be provided for update'
        });
    }

    // Validate each field if provided
    if (first_name !== undefined) {
        if (typeof first_name !== 'string' || first_name.trim().length < 2 || first_name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: 'First name must be between 2 and 50 characters'
            });
        }
        req.body.first_name = first_name.trim();
    }

    if (last_name !== undefined) {
        if (typeof last_name !== 'string' || last_name.trim().length < 2 || last_name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Last name must be between 2 and 50 characters'
            });
        }
        req.body.last_name = last_name.trim();
    }

    if (phone_number !== undefined) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone_number.toString().trim())) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits'
            });
        }
        req.body.phone_number = phone_number.toString().trim();
    }

    if (email !== undefined) {
        if (email === '') {
            req.body.email = null;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }
            req.body.email = email.trim().toLowerCase();
        }
    }

    next();
};

const validateAddress = (req, res, next) => {
    const { customer_id, address_details, city, state, pin_code, country } = req.body;

    // Check required fields
    if (!customer_id || !address_details || !city || !state || !pin_code) {
        return res.status(400).json({
            success: false,
            message: 'Customer ID, address details, city, state, and PIN code are required',
            missing_fields: {
                customer_id: !customer_id,
                address_details: !address_details,
                city: !city,
                state: !state,
                pin_code: !pin_code
            }
        });
    }

    // Validate customer_id
    if (!Number.isInteger(parseInt(customer_id)) || parseInt(customer_id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Customer ID must be a positive integer'
        });
    }

    // Validate address_details
    if (typeof address_details !== 'string' || address_details.trim().length < 10 || address_details.trim().length > 500) {
        return res.status(400).json({
            success: false,
            message: 'Address details must be between 10 and 500 characters'
        });
    }

    // Validate city
    if (typeof city !== 'string' || city.trim().length < 2 || city.trim().length > 100) {
        return res.status(400).json({
            success: false,
            message: 'City name must be between 2 and 100 characters'
        });
    }

    // Validate state
    if (typeof state !== 'string' || state.trim().length < 2 || state.trim().length > 100) {
        return res.status(400).json({
            success: false,
            message: 'State name must be between 2 and 100 characters'
        });
    }

    // Validate PIN code (6 digits for India)
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(pin_code.toString().trim())) {
        return res.status(400).json({
            success: false,
            message: 'PIN code must be exactly 6 digits'
        });
    }

    // Validate country if provided
    if (country && (typeof country !== 'string' || country.trim().length < 2 || country.trim().length > 100)) {
        return res.status(400).json({
            success: false,
            message: 'Country name must be between 2 and 100 characters'
        });
    }

    // Sanitize inputs
    req.body.customer_id = parseInt(customer_id);
    req.body.address_details = address_details.trim();
    req.body.city = city.trim();
    req.body.state = state.trim();
    req.body.pin_code = pin_code.toString().trim();
    if (country) {
        req.body.country = country.trim();
    }

    next();
};

module.exports = {
    validateCustomer,
    validateCustomerUpdate,
    validateAddress
};
