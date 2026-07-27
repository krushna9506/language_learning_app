class CategoryModel {
  final String id;
  final String title;
  final String description;
  final String iconName;

  CategoryModel({
    required this.id,
    required this.title,
    required this.description,
    required this.iconName,
  });

  factory CategoryModel.fromMap(String id, Map<String, dynamic> map) {
    return CategoryModel(
      id: id,
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      iconName: map['iconName'] ?? 'book',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'iconName': iconName,
    };
  }
}
